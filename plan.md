# NanoChat Desktop - Implementation Plan

## Human Instructions (Complete First)

> [!IMPORTANT]
> Complete these steps before starting development:

### 1. Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl wget file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

**Fedora:**
```bash
sudo dnf install -y \
    webkit2gtk4.1-devel \
    openssl-devel curl wget file \
    libxdo-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel
```

**Arch:**
```bash
sudo pacman -S --needed \
    webkit2gtk-4.1 base-devel \
    curl wget file openssl \
    libxdo libappindicator-gtk3 librsvg
```

### 2. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustc --version  # Verify 1.75+
```

### 3. Install Node.js

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node --version  # Verify v20+
```

### 4. Create API Key

1. Go to `https://nano.crocker-family.org` (or your server)
2. Navigate to Settings → API Keys
3. Create a new key named "NanoChat Desktop"
4. Save the key securely - you'll need it for testing

---

## Phase 1: Project Scaffolding

**Goal:** Initialize Tauri project with Svelte frontend

### 1.1 Initialize Tauri Project
```bash
cd /home/mark/projects/nanochat-desktop
npm create tauri-app@latest . -- --template svelte-ts --manager npm --yes
```

### 1.2 Install Additional Dependencies
```bash
npm install
```

### 1.3 Verify Setup
```bash
npm run tauri dev
```
- [x] Window opens with default Tauri welcome page
- [x] No build errors in terminal

### 1.4 Configure Tauri
Update `src-tauri/tauri.conf.json`:
- Set app name to "NanoChat Desktop"
- Set identifier to "org.nanochat.desktop"
- Set window title and default size (900x700)

---

## Phase 2: Configuration System

**Goal:** Read/write config from `~/.config/nanochat-desktop/config.toml`

### 2.1 Rust Backend - Config Module
Create `src-tauri/src/config.rs`:
- Define `Config` struct with `server_url` and `api_key` fields
- Implement `load_config()` - read TOML file or return defaults
- Implement `save_config()` - write TOML file
- Create config directory if it doesn't exist

### 2.2 Tauri Commands
Expose Rust functions to frontend:
- `get_config` - returns current config
- `save_config` - saves new config
- `validate_connection` - test API connection with provided credentials

### 2.3 Frontend - Settings UI
Create `src/lib/components/Settings.svelte`:
- Server URL input field
- API Key input field (password type with show/hide toggle)
- Save button
- Connection test button with status indicator

### 2.4 First-Run Flow
Modify `src/App.svelte`:
- Check if config exists on mount
- If no valid config, show Settings modal
- Block app usage until valid config is saved

**Verification:**
- [x] Config file created at `~/.config/nanochat-desktop/config.toml`
- [x] Settings saved persist across app restart
- [x] Connection test works with valid API key

---

## Phase 3: API Client Layer

**Goal:** TypeScript API client for all server endpoints

> [!NOTE]
> Refer to `api-docs.md` for complete endpoint details, request/response schemas, and CURL examples.

### 3.1 Type Definitions
Create `src/lib/api/types.ts`:
- `Conversation` interface (id, title, projectId, pinned, generating, costUsd, createdAt, updatedAt)
- `Message` interface (id, conversationId, role, content, contentHtml, modelId, reasoning, images, documents, createdAt)
- `Assistant` interface (id, name, description, systemPrompt, isDefault, defaultModelId, defaultWebSearchMode)
- `Project` interface (id, name, description, role, isShared, files, members)
- `ProjectFile` interface (id, projectId, storageId, fileName, fileType)
- `UserModel` interface (modelId, provider, enabled, pinned)
- `UserSettings` interface (privacyMode, contextMemoryEnabled, persistentMemoryEnabled, theme)
- `ApiKey` interface (id, name, lastUsedAt, createdAt)
- `GenerateMessageRequest` interface (with all options: message, model_id, assistant_id, project_id, conversation_id, web_search_enabled, web_search_mode, images, documents, reasoning_effort, temporary)
- `GenerateMessageResponse` interface (ok, conversation_id)
- `StorageItem` interface (storageId, url)

### 3.2 HTTP Client
Create `src/lib/api/client.ts`:
- `apiRequest()` helper with `Authorization: Bearer <api_key>` header injection
- Error handling wrapper with user-friendly messages
- Base URL from config
- Support for JSON, FormData, and binary request/response types

### 3.3 API Functions
Create the following modules in `src/lib/api/`:

**conversations.ts** - `/api/db/conversations`
- `listConversations(projectId?, search?, mode?)` - GET with optional filters
- `getConversation(id)` - GET with id parameter
- `createConversation(title, projectId?)` - POST with action: create
- `createWithMessage(content, role, images?, projectId?)` - POST with action: createWithMessage
- `updateTitle(conversationId, title)` - POST with action: updateTitle
- `togglePin(conversationId)` - POST with action: togglePin
- `setPublic(conversationId, public)` - POST with action: setPublic
- `deleteConversation(id)` - DELETE
- `deleteAllConversations()` - DELETE with all=true

**messages.ts** - `/api/db/messages` & `/api/generate-message`
- `getMessages(conversationId)` - GET messages for conversation
- `createMessage(conversationId, role, content)` - POST with action: create
- `updateMessageContent(messageId, content)` - POST with action: updateContent
- `deleteMessage(messageId)` - POST with action: delete
- `generateMessage(request: GenerateMessageRequest)` - POST to /api/generate-message
- `cancelGeneration(conversationId, sessionToken)` - POST to /api/cancel-generation

**models.ts** - `/api/db/user-models` & `/api/model-providers`
- `getUserModels(provider?)` - GET enabled models
- `setModelEnabled(provider, modelId, enabled)` - POST with action: set
- `toggleModelPinned(provider, modelId)` - POST with action: togglePinned
- `getModelProviders(modelId)` - GET available providers for a model

**assistants.ts** - `/api/assistants`
- `listAssistants()` - GET
- `createAssistant(name, systemPrompt, options?)` - POST
- `updateAssistant(id, updates)` - PATCH
- `deleteAssistant(id)` - DELETE
- `setDefaultAssistant(id)` - POST with action: setDefault

**projects.ts** - `/api/projects`
- `listProjects()` - GET
- `getProject(id)` - GET
- `createProject(name, description?, systemPrompt?, color?)` - POST
- `updateProject(id, updates)` - PATCH
- `deleteProject(id)` - DELETE

**project-files.ts** - `/api/projects/[id]/files`
- `listProjectFiles(projectId)` - GET
- `uploadProjectFile(projectId, file: File)` - POST (FormData)
- `deleteProjectFile(projectId, fileId)` - DELETE

**storage.ts** - `/api/storage`
- `uploadFile(file: File, contentType: string, filename?: string)` - POST
- `getFileUrl(storageId)` - GET
- `downloadFile(storageId)` - GET raw content
- `deleteFile(storageId)` - DELETE

**settings.ts** - `/api/db/user-settings`
- `getUserSettings()` - GET
- `updateUserSettings(updates)` - POST with action: update

**api-keys.ts** - `/api/api-keys`
- `listApiKeys()` - GET
- `createApiKey(name)` - POST
- `deleteApiKey(id)` - DELETE

**utilities.ts** - Utility endpoints
- `enhancePrompt(prompt)` - POST `/api/enhance-prompt`
- `generateFollowUpQuestions(conversationId, messageId)` - POST `/api/generate-follow-up-questions`
- `cleanupTempConversations()` - POST `/api/cleanup-temp-conversations`
- `getNanoGptBalance()` - POST `/api/nano-gpt/balance`

**Verification:**
- [x] Console log successful API responses
- [x] Error handling shows user-friendly messages

---

## Phase 4: Conversation List UI

**Goal:** Sidebar showing all conversations

### 4.1 Svelte Store
Create `src/lib/stores/conversations.ts`:
- Writable store for conversation list
- `loadConversations()` action
- `deleteConversation()` action

### 4.2 ConversationList Component
Create `src/lib/components/ConversationList.svelte`:
- Fetch and display all conversations
- Show title, date, generating status
- Click to select conversation
- Delete button (with confirmation)

### 4.3 Layout
Update `src/App.svelte`:
- Sidebar (280px) with conversation list
- Main content area for chat view
- Responsive layout

**Verification:**
- [x] Conversations from server appear in sidebar
- [x] Selecting conversation works
- [x] Delete removes conversation from list

---

## Phase 5: Chat View UI

**Goal:** View and send messages in a conversation

### 5.1 Message Store
Create `src/lib/stores/chat.ts`:
- Current conversation ID
- Messages array
- Loading/generating state
- `loadMessages()` action
- `sendMessage()` action

### 5.2 ChatMessage Component
Create `src/lib/components/ChatMessage.svelte`:
- Display user vs assistant messages differently
- Render `contentHtml` safely
- Show timestamp
- Handle images/documents display (placeholder for V2)

### 5.3 ChatInput Component
Create `src/lib/components/ChatInput.svelte`:
- Textarea for message input
- Send button
- Ctrl+Enter to send
- Disable while generating

### 5.4 ChatView Component
Create `src/lib/components/ChatView.svelte`:
- Message list with auto-scroll
- Input at bottom
- "Generating..." indicator
- Empty state for new conversations

### 5.5 Polling for Responses
Implement polling in `sendMessage()`:
- After POST to generate-message, poll messages every 500ms
- Check conversation `generating` flag
- Stop polling when generation complete

**Verification:**
- [x] Messages display correctly
- [x] New message sends and appears
- [x] AI response appears after generation
- [x] Auto-scroll works

---

## Phase 6: Model Selection

**Goal:** Allow user to choose AI model

### 6.1 Models Store
Create `src/lib/stores/models.ts`:
- Available models list
- Selected model ID
- `loadModels()` action

### 6.2 ModelSelector Component
Create `src/lib/components/ModelSelector.svelte`:
- Dropdown/select with available models
- Show only enabled models
- Persist selection

### 6.3 Integrate with Chat
- Add model selector to ChatInput or header
- Pass selected model to generate-message

**Verification:**
- [x] Models load from API
- [x] Selection changes model used for generation

---

## Phase 7: New Conversation

**Goal:** Create new conversations

### 7.1 New Chat Button
Add to ConversationList:
- "New Chat" button at top
- Creates empty conversation state
- Focus on input

### 7.2 Auto-Create Conversation
When sending first message to new chat:
- Use `createWithMessage` action
- Update conversation list
- Select new conversation

**Verification:**
- [x] New chat button works
- [x] First message creates conversation
- [x] New conversation appears in list

---

## Phase 8: Styling & Polish

**Goal:** Professional, modern UI

### 8.1 Global Styles
Create `src/app.css`:
- Dark theme color palette
- Typography (Inter font)
- Scrollbar styling
- Transitions/animations

### 8.2 Component Polish
- Loading skeletons
- Empty states
- Error states
- Hover effects
- Focus states

### 8.3 Responsive Tweaks
- Collapsible sidebar on smaller windows
- Proper resize handling

**Verification:**
- [x] App looks professional
- [x] All states (loading, error, empty) handled
- [x] Smooth animations

---

## Phase 9: Testing & Build

**Goal:** Verify everything works and create distributable

### 9.1 Manual Testing Checklist
- [x] Fresh install flow (no config)
- [x] Config saves and persists
- [x] Connection test works
- [x] Conversations list loads
- [x] Can view existing conversation
- [x] Can send message and receive response
- [x] Can create new conversation
- [x] Can delete conversation
- [x] Model selection works
- [x] App handles offline gracefully

### 9.2 Build Production
```bash
npm run tauri build
```
- [x] Check `src-tauri/target/release/bundle/` for outputs
- [x] Test `.deb` or `.AppImage` on fresh system
- [x] Build production distributable completed
- [x] AppImage builds successfully with build.sh helper script

---

## Future Phases (V2+)

> [!NOTE]
> These features leverage the comprehensive API endpoints documented in `api-docs.md`.

### V2 - File Attachments
- Add file picker to ChatInput
- Upload images via `/api/storage` (POST with binary content)
- Upload documents (PDF, Markdown, Text, EPUB) via storage
- Display attached images inline in messages
- Display document links/previews in messages
- Pass `images` and `documents` arrays to generate-message

### V2 - Assistants
- Load assistants from `/api/assistants` on app init
- Assistant selector dropdown in ChatInput or header
- Create/Edit/Delete assistants via Settings UI
- Pass `assistant_id` to generate-message
- Show assistant name/icon in chat header
- Set default assistant per user

### V2 - Web Search Integration
- Toggle web search in ChatInput
- Web search mode selector (off/standard/deep)
- Provider selector (linkup/tavily/exa/kagi)
- Pass `web_search_enabled`, `web_search_mode`, `web_search_provider` to generate-message
- Display search citations in assistant responses

### V3 - Projects
- Project list sidebar or dropdown
- Create/Edit/Delete projects via `/api/projects`
- Filter conversations by `projectId`
- Create conversations within projects
- Project file management (upload/download/delete via `/api/projects/[id]/files`)
- Project member management (add/remove via `/api/projects/[id]/members`)
- Project-specific system prompts

### V3 - User Settings Sync
- Fetch user settings from `/api/db/user-settings`
- Sync privacy mode, memory settings, theme preferences
- User rules management via `/api/db/user-rules`
- Custom system prompt rules

### V3 - Message Feedback
- Thumbs up/down ratings via `/api/db/message-ratings`
- Message interaction tracking (copy, share) via `/api/db/message-interactions`
- Follow-up question suggestions via `/api/generate-follow-up-questions`

### V4 - Advanced Features
- Text-to-Speech via `/api/tts` (audio playback of responses)
- Speech-to-Text via `/api/stt` (voice input)
- Video generation via `/api/video/generate` and status polling
- NanoGPT balance display via `/api/nano-gpt/balance`
- Model performance stats via `/api/db/model-performance`
- Provider preferences via `/api/provider-preferences`
- Prompt enhancement via `/api/enhance-prompt`
- Cancel generation via `/api/cancel-generation`
- Conversation branching via branch action
- Conversation sharing (public toggle)
- Conversation pinning

---

## File Structure (Final)

```
nanochat-desktop/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts         # HTTP client with auth
│   │   │   ├── types.ts          # All TypeScript interfaces
│   │   │   ├── conversations.ts  # Conversation CRUD
│   │   │   ├── messages.ts       # Message CRUD + generate
│   │   │   ├── models.ts         # User models & providers
│   │   │   ├── assistants.ts     # Assistant CRUD
│   │   │   ├── projects.ts       # Project CRUD
│   │   │   ├── project-files.ts  # Project file management
│   │   │   ├── storage.ts        # File upload/download
│   │   │   ├── settings.ts       # User settings
│   │   │   ├── api-keys.ts       # API key management
│   │   │   └── utilities.ts      # Misc utility endpoints
│   │   ├── components/
│   │   │   ├── ChatInput.svelte
│   │   │   ├── ChatMessage.svelte
│   │   │   ├── ChatView.svelte
│   │   │   ├── ConversationList.svelte
│   │   │   ├── ModelSelector.svelte
│   │   │   ├── AssistantSelector.svelte  # V2
│   │   │   ├── WebSearchToggle.svelte    # V2
│   │   │   ├── FileAttachment.svelte     # V2
│   │   │   ├── ProjectSelector.svelte    # V3
│   │   │   └── Settings.svelte
│   │   └── stores/
│   │       ├── chat.ts
│   │       ├── config.ts
│   │       ├── conversations.ts
│   │       ├── models.ts
│   │       ├── assistants.ts     # V2
│   │       └── projects.ts       # V3
│   ├── App.svelte
│   ├── app.css
│   ├── main.ts
│   └── vite-env.d.ts
├── src-tauri/
│   ├── src/
│   │   ├── config.rs
│   │   ├── lib.rs
│   │   └── main.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── icons/
├── api-docs.md                   # API reference documentation
├── plan.md                       # This implementation plan
├── package.json
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```


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

### 3.1 Type Definitions
Create `src/lib/api/types.ts`:
- `Conversation` interface
- `Message` interface
- `UserModel` interface
- `GenerateMessageRequest/Response` interfaces

### 3.2 HTTP Client
Create `src/lib/api/client.ts`:
- `apiRequest()` helper with auth header injection
- Error handling wrapper
- Base URL from config

### 3.3 API Functions
Create `src/lib/api/`:
- `conversations.ts` - list, get, create, delete conversations
- `messages.ts` - get messages, generate message
- `models.ts` - get available models

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
- [ ] Conversations from server appear in sidebar
- [ ] Selecting conversation works
- [ ] Delete removes conversation from list

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
- [ ] Messages display correctly
- [ ] New message sends and appears
- [ ] AI response appears after generation
- [ ] Auto-scroll works

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
- [ ] Models load from API
- [ ] Selection changes model used for generation

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
- [ ] New chat button works
- [ ] First message creates conversation
- [ ] New conversation appears in list

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
- [ ] App looks professional
- [ ] All states (loading, error, empty) handled
- [ ] Smooth animations

---

## Phase 9: Testing & Build

**Goal:** Verify everything works and create distributable

### 9.1 Manual Testing Checklist
- [ ] Fresh install flow (no config)
- [ ] Config saves and persists
- [ ] Connection test works
- [ ] Conversations list loads
- [ ] Can view existing conversation
- [ ] Can send message and receive response
- [ ] Can create new conversation
- [ ] Can delete conversation
- [ ] Model selection works
- [ ] App handles offline gracefully

### 9.2 Build Production
```bash
npm run tauri build
```
- Check `src-tauri/target/release/bundle/` for outputs
- Test `.deb` or `.AppImage` on fresh system

---

## Future Phases (V2+)

### V2 - File Attachments
- Add file picker to ChatInput
- Upload via `/api/storage`
- Display images/documents in messages

### V2 - Assistants
- Load assistants from API
- Assistant selector in UI
- Pass assistant_id to generate-message

### V3 - Projects
- Project list/selector
- Filter conversations by project
- Create conversations in projects

---

## File Structure (Final)

```
nanochat-desktop/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── conversations.ts
│   │   │   ├── messages.ts
│   │   │   ├── models.ts
│   │   │   └── types.ts
│   │   ├── components/
│   │   │   ├── ChatInput.svelte
│   │   │   ├── ChatMessage.svelte
│   │   │   ├── ChatView.svelte
│   │   │   ├── ConversationList.svelte
│   │   │   ├── ModelSelector.svelte
│   │   │   └── Settings.svelte
│   │   └── stores/
│   │       ├── chat.ts
│   │       ├── config.ts
│   │       ├── conversations.ts
│   │       └── models.ts
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
├── package.json
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

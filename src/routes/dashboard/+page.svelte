<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import "bootstrap/dist/css/bootstrap.min.css";
    import FileUploads from '../../components/FileUploads.svelte';
    import { goto } from "$app/navigation";
    import SchedulingCard from "../../components/SchedulingCard.svelte";

    // User data
    let userName = "Guest";
    let userEmail = "";

    // SMTP Configurations - MOCK DATA
    let smtpConfigs: Array<{ id: string; name: string; email: string }> = [
        { id: '1', name: 'Gmail SMTP', email: 'user@gmail.com' },
        { id: '2', name: 'Outlook SMTP', email: 'user@outlook.com' }
    ];
    let selectedConfig = "";
    let showAddConfigModal = false;

    // Email Content
    let emailSubject = "Hello ((firstName)), welcome to ((Company))!";
    let emailContent =
        "<p>Write your email content here... Use ((firstName)), ((Company)) for personalization. You can resize images by dragging the corner!</p>";

    // Edit Preview Mode State
    let editMode: "edit" | "preview" = "edit";
    let previewSubject = "";
    let previewContent = "";

    // File Uploads State
    let excelFile: File | null = null;
    let htmlTemplateFile: File | null = null;
    let excelStatus = "";
    let excelDetails = "";
    let totalContacts = 0;
    let sendRange: "all" | "first" | "range" = "all";
    let firstN = 50;
    let rangeFrom = 1;
    let rangeTo = 100;
    let delay = 20;

    // Scheduling State
    let scheduleEmail = false;
    let scheduledTime = "";
    let notifyEmail = "";
    let notifyBrowser = false;
    let enableBatchProcessing = false;
    let batchSize = 50;

    // Editor state
    const placeholders = [
        { value: "((firstName))", label: "First Name" },
        { value: "((lastName))", label: "Last Name" },
        { value: "((company))", label: "Company" },
        { value: "((email))", label: "Email" },
        { value: "((date))", label: "Current Date" },
        { value: "((phone))", label: "Phone" },
    ];

    // Editor reference
    let editorElement: HTMLElement;

    // Initialize - NO API CALLS
    onMount(() => {
        loadUserData();
        console.log("Dashboard loaded successfully - No API calls");
    });

    function loadUserData() {
        const token = localStorage.getItem("authToken");
        const user = localStorage.getItem("user");

        if (!token || !user) {
            return;
        }

        try {
            const userData = JSON.parse(user);
            userName = userData.name || "User";
            userEmail = userData.email || "";
        } catch (e) {
            console.error("Error loading user data");
        }
    }

    // File Upload Handlers
    async function handleExcelUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            excelFile = input.files[0];
            excelStatus = "Processing...";

            setTimeout(() => {
                totalContacts = 250;
                excelStatus = "File processed successfully";
                excelDetails = `${excelFile?.name} - ${totalContacts} contacts found`;
            }, 1000);
        }
    }

    function handleHtmlTemplateUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            htmlTemplateFile = input.files[0];

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === "string") {
                    emailContent = result;
                    if (editorElement) {
                        editorElement.innerHTML = result;
                    }
                }
            };
            reader.readAsText(htmlTemplateFile);
        }
    }

    // Send Range Handlers
    function handleSendRangeChange(value: "all" | "first" | "range") {
        sendRange = value;
    }

    function handleFirstNChange(value: number) {
        firstN = Math.max(1, Math.min(value, totalContacts));
    }

    function handleRangeFromChange(value: number) {
        rangeFrom = Math.max(1, Math.min(value, totalContacts));
    }

    function handleRangeToChange(value: number) {
        rangeTo = Math.max(1, Math.min(value, totalContacts));
    }

    function handleDelayChange(value: number) {
        delay = Math.max(15, Math.min(value, 30));
    }

    // Editor Functions
    function insertPlaceholder(placeholder: string) {
        if (editorElement) {
            document.execCommand("insertText", false, placeholder);
            emailContent = editorElement.innerHTML;
        }
    }

    function formatText(command: string) {
        if (editorElement) {
            document.execCommand(command, false, "");
            emailContent = editorElement.innerHTML;
        }
    }

    // Handle editor input
    function handleEditorInput() {
        if (editorElement) {
            emailContent = editorElement.innerHTML;
        }
    }

    // Toggle Edit/Preview Mode
    function toggleEditPreview() {
        if (editMode === "edit") {
            // Switch to Preview Mode
            editMode = "preview";

            // Create preview with formatting issues
            previewSubject = emailSubject
                .replace(/\(\(firstName\)\)/g, "(#irstNamej)")
                .replace(/\(\(Company\)\)/g, "((Company)!)");

            previewContent = emailContent
                .replace(
                    /\(\(firstName\)\)/g,
                    '<span class="placeholder-error">(#irstNamej)</span>',
                )
                .replace(
                    /\(\(lastName\)\)/g,
                    '<span class="placeholder-error">(#astNamej)</span>',
                )
                .replace(
                    /\(\(company\)\)/g,
                    '<span class="placeholder-error">((Company)!)</span>',
                )
                .replace(
                    /\(\(email\)\)/g,
                    '<span class="placeholder-error">((emai1))</span>',
                )
                .replace(
                    /\(\(date\)\)/g,
                    '<span class="placeholder-error">((tod@y))</span>',
                )
                .replace(
                    /\(\(phone\)\)/g,
                    '<span class="placeholder-error">((ph0ne))</span>',
                );
        } else {
            // Switch back to Edit Mode
            editMode = "edit";
        }
    }

    // Fix placeholder formatting
    function fixPlaceholders() {
        if (editMode === "preview") {
            // Fix the formatting issues
            emailSubject = previewSubject
                .replace(/\(#irstNamej\)/g, "((firstName))")
                .replace(/\(\(Company\)!\)/g, "((Company))");

            emailContent = previewContent
                .replace(
                    /<span class="placeholder-error">\(#irstNamej\)<\/span>/g,
                    "((firstName))",
                )
                .replace(
                    /<span class="placeholder-error">\(#astNamej\)<\/span>/g,
                    "((lastName))",
                )
                .replace(
                    /<span class="placeholder-error">\(\(Company\)!\)<\/span>/g,
                    "((company))",
                )
                .replace(
                    /<span class="placeholder-error">\(\(emai1\)\)<\/span>/g,
                    "((email))",
                )
                .replace(
                    /<span class="placeholder-error">\(\(tod@y\)\)<\/span>/g,
                    "((date))",
                )
                .replace(
                    /<span class="placeholder-error">\(\(ph0ne\)\)<\/span>/g,
                    "((phone))",
                );

            if (editorElement) {
                editorElement.innerHTML = emailContent;
            }

            editMode = "edit";
        }
    }

    // Calculate send count
    function calculateSendCount(): number {
        if (totalContacts === 0) return 0;

        if (sendRange === "all") return totalContacts;
        if (sendRange === "first") return Math.min(firstN, totalContacts);
        if (sendRange === "range") {
            const from = Math.max(1, rangeFrom);
            const to = Math.min(rangeTo, totalContacts);
            return Math.max(0, to - from + 1);
        }
        return 0;
    }

    // Main Action Handlers - NO API CALLS
    async function handleSendEmail() {
        if (!selectedConfig) {
            alert("Please select an SMTP configuration");
            return;
        }

        if (!excelFile) {
            alert("Please upload an Excel file with contacts");
            return;
        }

        const sendCount = calculateSendCount();
        if (sendCount === 0) {
            alert("No contacts to send emails to");
            return;
        }

        // Mock form data (no actual API call)
        const formData = {
            subject: emailSubject,
            configId: selectedConfig,
            totalContacts: sendCount,
            delay: delay
        };

        try {
            // ✅ MOCK SUCCESS - NO API CALL
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert(`✅ ${sendCount} emails queued successfully! (Mock)`);
            
        } catch (error) {
            console.error("Error sending emails:", error);
            alert("Error sending emails");
        }
    }

    function handleSaveDraft() {
        const draft = {
            subject: emailSubject,
            content: emailContent,
            excelFile: excelFile?.name || "",
            delay: delay,
            sendRange: sendRange,
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem("emailDraft", JSON.stringify(draft));
        alert("Draft saved successfully!");
    }

    function loadDraft() {
        const draft = localStorage.getItem("emailDraft");
        if (draft) {
            const parsed = JSON.parse(draft);
            emailSubject = parsed.subject;
            emailContent = parsed.content;
            if (editorElement) {
                editorElement.innerHTML = parsed.content;
            }
        }
    }
</script>

<!-- Dashboard Content -->
<div class="container-fluid mt-4">
    <div class="row">
        <!-- Left Panel - Configuration -->
        <div class="col-md-4">
            <!-- SMTP Configuration Card -->
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="bi bi-gear me-2"></i>SMTP Configuration
                    </h5>
                </div>
                <div class="card-body">
                    {#if smtpConfigs.length === 0}
                        <div class="alert alert-warning">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            <strong>No SMTP configurations found</strong>
                            <p class="mb-0 mt-1 small">
                                Add your first configuration to start sending emails
                            </p>
                        </div>
                    {:else}
                        <div class="mb-3">
                            <label class="form-label">Select Configuration *</label>
                            <select class="form-select" bind:value={selectedConfig}>
                                <option value="">Choose an SMTP configuration</option>
                                {#each smtpConfigs as config}
                                    <option value={config.id}>
                                        {config.name} ({config.email})
                                    </option>
                                {/each}
                            </select>
                        </div>
                    {/if}

                    <button
                        class="btn btn-outline-primary w-100"
                        on:click={() => (showAddConfigModal = true)}
                    >
                        <i class="bi bi-plus-circle me-2"></i>
                        {smtpConfigs.length === 0 ? "Add First Configuration" : "Add New"}
                    </button>

                    <!-- SMTP Provider Guidelines -->
                    <div class="mt-3 pt-3 border-top">
                        <h6 class="fw-bold">SMTP Provider Guidelines:</h6>
                        <ul class="small mb-0">
                            <li><strong>Gmail:</strong> Use App Passwords, not regular password</li>
                            <li><strong>Outlook:</strong> Regular password usually works</li>
                            <li><strong>Respect provider sending limits</strong></li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- File Uploads Component -->
            <FileUploads
                onExcelUpload={handleExcelUpload}
                onHtmlTemplateUpload={handleHtmlTemplateUpload}
                {excelStatus}
                {excelDetails}
                {totalContacts}
                {sendRange}
                {firstN}
                {rangeFrom}
                {rangeTo}
                {delay}
                onSendRangeChange={handleSendRangeChange}
                onFirstNChange={handleFirstNChange}
                onRangeFromChange={handleRangeFromChange}
                onRangeToChange={handleRangeToChange}
                onDelayChange={handleDelayChange}
            />

            <!-- Scheduling Card -->
            <SchedulingCard
                bind:enableBatchProcessing
                bind:batchSize
                bind:scheduleEmail
                bind:scheduledTime
                bind:notifyEmail
                bind:notifyBrowser
            />
        </div>

        <!-- Right Panel - Email Content -->
        <div class="col-md-8">
            <div class="card">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-0"><i class="bi bi-envelope me-2"></i>Email Content</h5>
                    </div>

                    <!-- Edit/Preview Toggle -->
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm btn-light me-2" on:click={loadDraft}>
                            <i class="bi bi-folder me-1"></i>Load Draft
                        </button>

                        <div class="btn-group" role="group">
                            <button
                                type="button"
                                class="btn btn-sm {editMode === 'edit' ? 'btn-warning' : 'btn-outline-warning'}"
                                on:click={() => (editMode = "edit")}
                                title="Edit Mode"
                            >
                                <i class="bi bi-pencil me-1"></i>Edit
                            </button>
                            <button
                                type="button"
                                class="btn btn-sm {editMode === 'preview' ? 'btn-info' : 'btn-outline-info'}"
                                on:click={toggleEditPreview}
                                title="Preview Mode"
                            >
                                <i class="bi bi-eye me-1"></i>Preview
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-body">
                    {#if editMode === "edit"}
                        <!-- Edit Mode -->
                        <!-- Subject -->
                        <div class="mb-4">
                            <label class="form-label fw-bold">Subject *</label>
                            <input
                                type="text"
                                class="form-control"
                                bind:value={emailSubject}
                                placeholder="Hello ((firstName)), welcome to ((Company))!"
                            />
                            <div class="form-text">
                                You can use placeholders like ((firstName)), ((company)), etc.
                            </div>
                        </div>

                        <hr />

                        <!-- Email Content Editor -->
                        <div class="mb-3">
                            <label class="form-label fw-bold">Email Content</label>

                            <!-- Formatting Toolbar -->
                            <div class="btn-toolbar mb-3" role="toolbar">
                                <div class="btn-group me-2 mb-2" role="group">
                                    <button class="btn btn-outline-secondary" type="button"
                                        on:click={() => formatText("bold")} title="Bold">
                                        <strong>B</strong>
                                    </button>
                                    <button class="btn btn-outline-secondary" type="button"
                                        on:click={() => formatText("italic")} title="Italic">
                                        <em>I</em>
                                    </button>
                                    <button class="btn btn-outline-secondary" type="button"
                                        on:click={() => formatText("underline")} title="Underline">
                                        <u>U</u>
                                    </button>
                                    <button class="btn btn-outline-secondary" type="button"
                                        on:click={() => formatText("strikethrough")} title="Strikethrough">
                                        <s>S</s>
                                    </button>
                                    <button class="btn btn-outline-secondary" type="button"
                                        on:click={() => formatText("justifyLeft")} title="Align Left">
                                        <i class="bi bi-text-left"></i>
                                    </button>
                                    <button class="btn btn-outline-secondary" type="button"
                                        on:click={() => formatText("justifyCenter")} title="Align Center">
                                        <i class="bi bi-text-center"></i>
                                    </button>
                                    <button class="btn btn-outline-secondary" type="button"
                                        on:click={() => formatText("insertUnorderedList")} title="Bullet List">
                                        <i class="bi bi-list-ul"></i>
                                    </button>
                                    <button class="btn btn-outline-secondary" type="button"
                                        on:click={() => formatText("insertOrderedList")} title="Numbered List">
                                        <i class="bi bi-list-ol"></i>
                                    </button>
                                </div>

                                <!-- Placeholders Dropdown -->
                                <div class="dropdown mb-2">
                                    <button class="btn btn-outline-primary dropdown-toggle" type="button"
                                        data-bs-toggle="dropdown">
                                        <i class="bi bi-tag me-1"></i>Insert Placeholder
                                    </button>
                                    <ul class="dropdown-menu">
                                        {#each placeholders as placeholder}
                                            <li>
                                                <a class="dropdown-item" href="#"
                                                    on:click|preventDefault={() => insertPlaceholder(placeholder.value)}>
                                                    <strong>{placeholder.value}</strong> - {placeholder.label}
                                                </a>
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            </div>

                            <!-- Content Editor -->
                            <div contenteditable="true" class="form-control editor" bind:this={editorElement}
                                on:input={handleEditorInput}>
                                {@html emailContent}
                            </div>

                            <div class="mt-2">
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Use placeholders like ((firstName)), ((company)) in your content. You can now resize images by dragging the corner!!
                                </small>
                            </div>
                        </div>
                    {:else}
                        <!-- Preview Mode -->
                        <div class="preview-mode">
                            <div class="alert alert-warning d-flex align-items-center">
                                <i class="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                                <div>
                                    <h6 class="mb-1">Potential Formatting Issues Detected</h6>
                                    <p class="mb-0 small">Some placeholders appear to have formatting errors. Review and fix before sending.</p>
                                </div>
                                <button class="btn btn-sm btn-outline-danger ms-auto" on:click={fixPlaceholders}>
                                    <i class="bi bi-wrench me-1"></i>Fix All
                                </button>
                            </div>

                            <!-- Preview Subject -->
                            <div class="mb-4">
                                <label class="form-label fw-bold text-muted">Subject Preview</label>
                                <div class="preview-subject p-3 bg-light border rounded">
                                    {previewSubject}
                                </div>
                                <div class="form-text text-danger">
                                    <i class="bi bi-exclamation-circle me-1"></i>
                                    Note: Placeholders show formatting inconsistencies
                                </div>
                            </div>

                            <hr />

                            <!-- Preview Content -->
                            <div class="mb-3">
                                <label class="form-label fw-bold text-muted">Email Content Preview</label>
                                <div class="preview-content p-3 border rounded bg-white">
                                    {@html previewContent}
                                </div>

                                <div class="mt-3">
                                    <div class="alert alert-info">
                                        <h6><i class="bi bi-lightbulb me-2"></i>Preview Mode:</h6>
                                        <ul class="mb-0 small">
                                            <li>This shows how your email will appear with sample data</li>
                                            <li>Highlighted sections indicate formatting issues</li>
                                            <li>Click "Fix All" to automatically correct placeholder formatting</li>
                                            <li>Return to Edit mode to make manual corrections</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Placeholder Preview -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="bi bi-card-checklist me-2"></i>Available Placeholders</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                {#each placeholders as placeholder}
                                    <div class="col-md-4 mb-2">
                                        <div class="d-flex align-items-center">
                                            <code class="bg-light p-1 rounded me-2">{placeholder.value}</code>
                                            <span class="small">{placeholder.label}</span>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                            {#if editMode === "preview"}
                                <div class="mt-3">
                                    <div class="alert alert-danger small">
                                        <i class="bi bi-exclamation-octagon me-2"></i>
                                        <strong>Preview shows formatting issues:</strong>
                                        (#irstNamej) should be ((firstName)), ((Company)!) should be ((company))
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <button class="btn btn-outline-secondary" on:click={handleSaveDraft}>
                                <i class="bi bi-save me-2"></i>Save as Draft
                            </button>

                            {#if editMode === "preview"}
                                <button class="btn btn-outline-warning ms-2" on:click={() => (editMode = "edit")}>
                                    <i class="bi bi-pencil me-2"></i>Back to Edit
                                </button>
                            {/if}
                        </div>

                        <div>
                            {#if totalContacts > 0}
                                <span class="me-3 text-muted">
                                    <i class="bi bi-people me-1"></i>
                                    {calculateSendCount()} of {totalContacts} contacts
                                </span>
                            {/if}

                            <button class="btn btn-success" on:click={handleSendEmail}
                                disabled={!selectedConfig || !excelFile}>
                                <i class="bi bi-send me-2"></i>
                                {scheduleEmail ? "Schedule Email" : "Send Email Now"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Instructions -->
            <div class="alert alert-info mt-3">
                <h6><i class="bi bi-lightbulb me-2"></i>Tips for Best Results:</h6>
                <ul class="mb-0">
                    <li class="small">Use a delay of 20-30 seconds between emails to avoid spam filters</li>
                    <li class="small">Test with a small batch first before sending to all contacts</li>
                    <li class="small">Make sure your Excel file has the required columns</li>
                    <li class="small">Personalized emails have higher engagement rates</li>
                    <li class="small">Use Preview mode to check for formatting issues before sending</li>
                </ul>
            </div>
        </div>
    </div>
</div>

<!-- Add Config Modal -->
{#if showAddConfigModal}
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)"
        on:click={() => (showAddConfigModal = false)}>
        <div class="modal-dialog" on:click|stopPropagation>
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add SMTP Configuration</h5>
                    <button type="button" class="btn-close" on:click={() => (showAddConfigModal = false)}></button>
                </div>
                <div class="modal-body">
                    <p>Configuration form will go here...</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" on:click={() => (showAddConfigModal = false)}>
                        Cancel
                    </button>
                    <button type="button" class="btn btn-primary">Save Configuration</button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .editor {
        min-height: 300px;
        max-height: 500px;
        overflow-y: auto;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        padding: 0.75rem;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
    }

    .editor:focus {
        border-color: #86b7fe;
        outline: 0;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .editor img {
        max-width: 100%;
        height: auto;
        cursor: move;
        resize: both;
    }

    /* Preview Mode Styles */
    .preview-mode .preview-subject {
        font-size: 1.1rem;
        font-weight: 500;
        color: #333;
    }

    .preview-mode .preview-content {
        min-height: 300px;
        max-height: 500px;
        overflow-y: auto;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        background: linear-gradient(90deg, #f8f9fa 0px, #f8f9fa 1px, transparent 1px, transparent 100%);
        background-size: 100% 1.6em;
    }

    .placeholder-error {
        background-color: #fff3cd;
        color: #856404;
        border: 1px dashed #ffeaa7;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
    }

    .preview-mode .btn-group .btn.active {
        box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    }

    /* Toolbar button styling similar to screenshot */
    .btn-toolbar .btn-group .btn {
        min-width: 40px;
        text-align: center;
        font-weight: bold;
    }

    /* Navbar active link styling */
    .nav-link.active {
        font-weight: bold;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }
</style>
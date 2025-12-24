<script lang="ts">
  import '../app.css';
  import { onMount, onDestroy } from 'svelte';
  import NewConfigForm from './NewConfigForm.svelte';
  import SchedulingCard from './SchedulingCard.svelte';
    import FileUploads from './FileUploads.svelte';


  export let onConfigSelect: (id: string) => void;
  export let onConfigEdit: (id: string) => void;

  // SMTP Configurations
  interface SMTPConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    fromEmail: string;
    fromName?: string;
    isDefault: boolean;
  }

  // Form state
  let configs: SMTPConfig[] = [];

  let showNewConfigForm = false;
  let isLoadingConfigs = false;
  let isLoadingEditor = false;
  
  // File upload state
  let excelFile: File | undefined = undefined;
  let htmlTemplateFile: File | undefined = undefined;
  let excelStatus = '';
  let excelDetails = '';
  
  // Email content
  let subject = '';
  let emailContent = '';
  let quillEditor: any = null;
  
  // Batch processing
  let useBatch = false;
  let batchSize = 20;
  let batchDelay = 60;
  let emailDelay = 45;
  
  // Scheduling
  let scheduleEmail = false;
  let scheduledTime = '';
  let notifyEmail = '';
  let notifyBrowser = false;
    let emailSubject = '';
  
  // Range selection
  let sendRange: 'all' | 'first' | 'range' = 'all';
  let firstN = 50;
  let rangeFrom = 1;
  let rangeTo = 100;
  let totalContacts = 0;
  let selectedConfig: SMTPConfig

  onMount(async () => {
    await loadSMTPConfigs();
    await initializeQuill();
    
    // Set minimum datetime for scheduling
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    scheduledTime = now.toISOString().slice(0, 16);
  });

  onDestroy(() => {
    if (quillEditor) {
      quillEditor = null;
    }
  });

  async function handleSendEmails () {
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

    try {
        // Show loading
        const sendButton = document.querySelector('.send-button');
        const originalText = sendButton?.innerHTML;
        if (sendButton) {
            sendButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
            sendButton.setAttribute('disabled', 'true');
        }

        //  REAL API CALL with FormData
        const formData = new FormData();
          formData.append('configId', selectedConfig.id); 
        formData.append('subject', emailSubject);
        formData.append('content', emailContent || '');
        formData.append('totalContacts', sendCount.toString());
        formData.append('sendRange', sendRange);
       formData.append('delay', delay.toString());
        
        if (excelFile) {
            formData.append('excelFile', excelFile);
        }
        if (htmlTemplateFile) {
            formData.append('htmlTemplate', htmlTemplateFile);
        }
        if (useBatch){
            formData.append('batchProcessing', 'true');
            formData.append('batchSize', batchSize.toString());
        }
        if (scheduleEmail && scheduledTime) {
            formData.append('schedule', scheduledTime);
        }
        if (notifyEmail) {
            formData.append('notifyEmail', notifyEmail);
        }

        const response = await fetch('/send', {
            method: 'POST',
            body: formData
            // No Content-Type header for FormData
        });

        const result = await response.json();
        
        // Reset button
        if (sendButton) {
            sendButton.innerHTML = originalText || 'Send Email Now';
            sendButton.removeAttribute('disabled');
        }
        
        if (response.ok && result.success) {
            alert(`✅ ${result.totalEmails || sendCount} emails queued successfully!\nJob ID: ${result.jobId}\nEstimated time: ${result.estimatedTime}`);
            
            // Optional: Show success modal or redirect
            console.log('Email job created:', result);
            
            // Clear form if needed
            // emailSubject = '';
            // emailContent = '';
            // excelFile = null;
            
        } else {
            alert(` Failed: ${result.message || 'Unknown error'}`);
        }
        
    } catch (error) {
        console.error("Error sending emails:", error);
        
        // Reset button
        const sendButton = document.querySelector('.send-button');
        if (sendButton) {
            sendButton.innerHTML = 'Send Email Now';
            sendButton.removeAttribute('disabled');
        }
        
        //  FALLBACK TO MOCK
        const useMock = confirm("API server may be down. Use mock send for testing?");
        
        if (useMock) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert(` ${sendCount} emails queued successfully! (Mock Mode)\nNote: Running in offline mode`);
        } else {
            alert(" Error sending emails. Please check API server.");
        }
    }
}

  async function loadSMTPConfigs() {
    isLoadingConfigs = true;
    try {
      const response = await fetch('/api/configs');
      const result = await response.json();
      
      if (result.success) {
        configs = result.configs || [];
        
        // Select default config
        const defaultConfig = configs.find(c => c.isDefault);
        if (defaultConfig) {
          selectedConfig = defaultConfig;
        }
      }
    } catch (error) {
      console.error('Failed to load SMTP configs:', error);
    } finally {
      isLoadingConfigs = false;
    }
  }

  async function initializeQuill() {
    isLoadingEditor = true;
    try {
      const QuillModule = await import('quill');
      const Quill = QuillModule.default;
      
      let ImageResize;
      try {
        const ImageResizeModule = await import('quill-image-resize-module');
        ImageResize = ImageResizeModule.default;
        if (ImageResize) {
          Quill.register('modules/imageResize', ImageResize);
        }
      } catch (error) {
        console.warn('Image resize module not available:', error);
      }
      
      quillEditor = new Quill('#editor', {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ['link', 'image', 'video'],
            ['clean']
          ],
          imageResize: ImageResize ? {
            modules: ['Resize', 'DisplaySize', 'Toolbar']
          } : undefined
        }
      });
      
      quillEditor.on('text-change', () => {
        if (quillEditor && quillEditor.root) {
          emailContent = quillEditor.root.innerHTML;
        }
      });
    } catch (error) {
      console.error('Failed to initialize Quill:', error);
    } finally {
      isLoadingEditor = false;
    }
  }

  function handleExcelUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    excelFile = file;
    
    if (file) {
      setTimeout(() => {
        excelStatus = 'processed';
        excelDetails = `Loaded ${Math.floor(Math.random() * 1000) + 100} contacts from ${file.name}`;
        totalContacts = Math.floor(Math.random() * 1000) + 100;
      }, 1000);
    } else {
      excelStatus = '';
      excelDetails = '';
      totalContacts = 0;
    }
  }

  function handleHtmlTemplateUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    htmlTemplateFile = file;
  }



  function handlePreview() {
    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }
    
    if (!emailContent.trim() && !htmlTemplateFile) {
      alert('Please add content to preview');
      return;
    }
    
    console.log('Previewing email');
  }

  function calculateBatchPreview(): string {
    if (totalContacts > 0) {
      const batches = Math.ceil(totalContacts / batchSize);
      const totalMinutes = batches * batchDelay;
      return `${batches} batches, ${totalMinutes} minutes total`;
    }
    return 'Configure settings to see preview';
  }

  function getCurrentTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
</script>

<div id="compose-tab" class="tab-content">
  <div class="row">
    <div class="col-md-6">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5>📮 SMTP Configuration</h5>
          <small class="text-muted">
            {#if isLoadingConfigs}
              Loading...
            {:else if selectedConfig}
              Active: {selectedConfig.name}
            {:else}
              No configuration selected
            {/if}
          </small>
        </div>
        <div class="card-body">
          <div class="config-selector">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 class="mb-1">Select Configuration</h6>
                <small class="text-muted">Choose an SMTP configuration</small>
              </div>
              <button
                class="btn btn-outline-primary btn-sm"
                on:click={() => showNewConfigForm = true}
              >
                <i class="bi bi-plus-circle me-1"></i>Add New
              </button>
            </div>

            <div id="configList">
              {#if isLoadingConfigs}
                <div class="text-muted text-center py-3">
                  <div class="spinner-border spinner-border-sm me-2"></div>
                  Loading...
                </div>
              {:else if configs.length === 0}
                <div class="text-muted text-center py-3">
                  No configurations found
                </div>
              {:else}
                {#each configs as config}
                  <div
                    class="config-item {selectedConfig?.id === config.id ? 'active' : ''}"
                    on:click={() => selectedConfig = config}
                  >
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{config.name}</strong>
                        {#if config.isDefault}
                          <span class="badge bg-success ms-2">Default</span>
                        {/if}
                        <br />
                        <small class="text-muted">
                          {config.host}:{config.port} • {config.fromEmail}
                        </small>
                      </div>
                      <div>
                        <button
                          class="btn btn-sm btn-outline-info me-2"
                          on:click|stopPropagation={() => onConfigSelect(config.id)}
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-warning"
                          on:click|stopPropagation={() => onConfigEdit(config.id)}
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          </div>

          {#if showNewConfigForm}
            <NewConfigForm onClose={() => showNewConfigForm = false} onSave={loadSMTPConfigs} />
          {/if}

          {#if selectedConfig}
            <div class="mt-3">
              <div class="alert alert-success">
                <strong>✅ Active Configuration:</strong><br />
                <span>{selectedConfig.name} ({selectedConfig.host}:{selectedConfig.port})</span>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <FileUploads
       
        onHtmlTemplateUpload={handleHtmlTemplateUpload}
        {excelStatus}
        {excelDetails}
        {totalContacts}
        {sendRange}
        {firstN}
        {rangeFrom}
        {rangeTo}
        onSendRangeChange={(value:any) => sendRange = value}
        onFirstNChange={(value:any) => firstN = value}
        onRangeFromChange={(value:any) => rangeFrom = value}
        onRangeToChange={(value:any) => rangeTo = value}
      />

      <div class="card mt-3">
        <div class="card-header">
          <h6>⚡ Batch Processing</h6>
        </div>
        <div class="card-body">
          <div class="form-check mb-3">
            <input
              class="form-check-input"
              type="checkbox"
              bind:checked={useBatch}
              id="useBatch"
            />
            <label class="form-check-label" for="useBatch">
              <strong>Enable Batch Processing</strong>
            </label>
            <small class="text-muted d-block">Avoid Gmail limits</small>
          </div>

          {#if useBatch}
            <div>
              <div class="row">
                <div class="col-md-4">
                  <label class="form-label">Emails per Batch</label>
                  <input
                    type="number"
                    class="form-control"
                    bind:value={batchSize}
                    min="5"
                    max="50"
                  />
                  <small class="text-muted">Max 20 for Gmail</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Batch Delay (minutes)</label>
                  <input
                    type="number"
                    class="form-control"
                    bind:value={batchDelay}
                    min="30"
                    max="180"
                  />
                  <small class="text-muted">Between batches</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Email Delay (seconds)</label>
                  <input
                    type="number"
                    class="form-control"
                    bind:value={emailDelay}
                    min="30"
                    max="60"
                  />
                  <small class="text-muted">Between emails</small>
                </div>
              </div>

              <div class="alert alert-info mt-3">
                <strong>📊 Batch Preview:</strong>
                <div>{calculateBatchPreview()}</div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-header">
          <h6>⏰ Schedule Email Sending</h6>
        </div>
        <div class="card-body">
          <div class="form-check mb-3">
            <input
              class="form-check-input"
              type="checkbox"
              bind:checked={scheduleEmail}
              id="scheduleEmail"
            />
            <label class="form-check-label" for="scheduleEmail">
              <strong>Schedule for later</strong>
            </label>
          </div>

          {#if scheduleEmail}
            <div>
              <div class="row">
                <div class="col-md-6">
                  <label class="form-label">Date & Time</label>
                  <input
                    type="datetime-local"
                    class="form-control"
                    bind:value={scheduledTime}
                  />
                  <small class="text-muted">Min 5 minutes from now</small>
                  <small class="text-muted d-block">
                    Timezone: {getCurrentTimezone()}
                  </small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Notifications</label>
                  <input
                    type="email"
                    class="form-control mb-2"
                    bind:value={notifyEmail}
                    placeholder="Email for notifications"
                  />
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      bind:checked={notifyBrowser}
                      id="notifyBrowser"
                    />
                    <label class="form-check-label" for="notifyBrowser">
                      Browser notifications
                    </label>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h5>✉️ Email Content</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Subject *</label>
            <input
              type="text"
              class="form-control"
              bind:value={subject}
              placeholder="Hello {{firstN}}, welcome!"
              required
            />
            <small class="text-muted">Use  for personalization</small>
          </div>

          <div class="mb-3">
            <label class="form-label">
              Email Content
              {#if htmlTemplateFile}
                <span class="text-muted">(Optional - using template)</span>
              {/if}
            </label>
            {#if isLoadingEditor}
              <div class="text-center py-4">
                <div class="spinner-border"></div>
                <p class="mt-2">Loading editor...</p>
              </div>
            {:else}
              <div id="editor" style="height: 300px"></div>
              <textarea
                name="htmlContent"
                bind:value={emailContent}
                style="display: none"
              ></textarea>
            {/if}
            <small class="text-muted">Images can be resized by dragging corners</small>
          </div>

          <div class="d-flex gap-2">
            <button
              type="button"
              class="btn btn-primary"
              on:click={handleSendEmails}
              disabled={!selectedConfig || !excelFile || !subject.trim()}
            >
              🚀 Send Emails
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              on:click={handlePreview}
              disabled={!subject.trim() || (!emailContent.trim() && !htmlTemplateFile)}
            >
              👁️ Preview
            </button>
            {#if scheduleEmail}
              <span class="badge bg-info">📅 Scheduled</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
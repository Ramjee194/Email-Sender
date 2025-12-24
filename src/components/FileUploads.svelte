<!-- src/components/FileUploads.svelte -->
<script lang="ts">
  // Event handlers
  export let onExcelUpload: (event: Event) => Promise<void> = async () => {};
  export let onHtmlTemplateUpload: (event: Event) => void = () => {};
  
  // Excel file info
  export let excelStatus: string = '';
  export let excelDetails: string = '';
  export let totalContacts: number = 0;
  
  // Send range options
  export let sendRange: 'all' | 'first' | 'range' = 'all';
  export let firstN: number = 50;
  export let rangeFrom: number = 1;
  export let rangeTo: number = 100;
  export let delay: number = 20;
  
  // Range change handlers
  export let onSendRangeChange: (value: 'all' | 'first' | 'range') => void = () => {};
  export let onFirstNChange: (value: number) => void = () => {};
  export let onRangeFromChange: (value: number) => void = () => {};
  export let onRangeToChange: (value: number) => void = () => {};
  export let onDelayChange: (value: number) => void = () => {};

  function handleExcelFileChange(event: Event) {
    onExcelUpload(event);
  }

  function handleHtmlTemplateChange(event: Event) {
    onHtmlTemplateUpload(event);
  }

  function calculateSendCount(): number {
    if (totalContacts === 0) return 0;
    
    if (sendRange === 'all') return totalContacts;
    if (sendRange === 'first') return Math.min(firstN, totalContacts);
    if (sendRange === 'range') {
      const from = Math.max(1, rangeFrom);
      const to = Math.min(rangeTo, totalContacts);
      return Math.max(0, to - from + 1);
    }
    return 0;
  }
</script>

<div class="card">
  <div class="card-header">
    <h5>📄 File Uploads</h5>
  </div>
  <div class="card-body">
    <div class="mb-3">
      <label class="form-label">Excel File (Contacts) *</label>
      <input
        type="file"
        class="form-control"
        accept=".xlsx,.xls"
        required
        on:change={handleExcelFileChange}
      />
      <small class="text-muted"
        >Required columns: Email. Optional: FirstName, LastName,
        Company, Subject</small
      >
      <br />

      <a
        href="/public/samples/sample-contacts.xlsx"
        class="btn btn-sm btn-outline-secondary mt-2"
        >📥 Download Sample</a
      >
    </div>

    {#if excelStatus}
      <div class="alert alert-success">
        <strong>✅ Excel File Processed</strong><br />
        <span>{excelDetails}</span>
      </div>
    {/if}

    <!-- Email Range Selection -->
    {#if totalContacts > 0}
      <div class="mb-3">
        <label class="form-label">📊 Email Range Selection</label>
        <div class="card border-info">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <label class="form-label">Send Range</label>
                <select class="form-control" bind:value={sendRange}>
                  <option value="all">Send to All Contacts</option>
                  <option value="first">Send to First N Contacts</option>
                  <option value="range">Send to Specific Range</option>
                </select>
              </div>
              <div class="col-md-6">
                {#if sendRange === 'first'}
                  <div>
                    <label class="form-label">Number of Emails</label>
                    <input
                      type="number"
                      class="form-control"
                      bind:value={firstN}
                      min="1"
                      max={totalContacts}
                      placeholder="e.g., 50"
                    />
                    <small class="text-muted">Send to first N contacts</small>
                  </div>
                {:else if sendRange === 'range'}
                  <div>
                    <div class="row">
                      <div class="col-6">
                        <label class="form-label">From</label>
                        <input
                          type="number"
                          class="form-control"
                          bind:value={rangeFrom}
                          min="1"
                          max={totalContacts}
                          placeholder="1"
                        />
                      </div>
                      <div class="col-6">
                        <label class="form-label">To</label>
                        <input
                          type="number"
                          class="form-control"
                          bind:value={rangeTo}
                          min="1"
                          max={totalContacts}
                          placeholder="100"
                        />
                      </div>
                    </div>
                    <small class="text-muted"
                      >Send to contacts from row X to row Y</small
                    >
                  </div>
                {/if}
              </div>
            </div>
            <div class="mt-3">
              <div class="alert alert-info">
                <strong>📧 Email Preview:</strong> Will send to {calculateSendCount()} of {totalContacts} contacts
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <div class="mb-3">
      <label class="form-label">HTML Template (Optional)</label>
      <input
        type="file"
        class="form-control"
        accept=".html"
        on:change={handleHtmlTemplateChange}
      />
      <small class="text-muted"
        >If provided, will override the editor content below</small
      >
    </div>

    <div class="mb-3">
      <label class="form-label">Delay Between Emails (seconds)</label>
      <input
        type="number"
        class="form-control"
        bind:value={delay}
        min="15"
        max="30"
      />
      <small class="text-muted"
        >Delay between each email (15-30 seconds recommended)</small
      >
    </div>

    <div class="alert alert-warning">
      <strong>⚠️ SMTP Provider Guidelines:</strong><br />
      <small>
        • Gmail: Use App Passwords, not regular password<br />
        • Outlook: Regular password usually works<br />
        • Respect provider sending limits
      </small>
    </div>
  </div>
</div>
<script lang="ts">
  export let onClose: () => void;
  export let subject = '';
  export let content = '';
</script>

<div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" on:click={onClose}>
  <div class="modal-dialog modal-lg" on:click|stopPropagation>
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Email Preview</h5>
        <button type="button" class="btn-close" on:click={onClose}></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <strong>Subject:</strong> <span id="previewSubject">{subject}</span>
        </div>
        <div id="previewContent" class="border p-3 bg-light" style="min-height: 200px;">
          {@html content}
        </div>
      </div>
    </div>
  </div>
</div>
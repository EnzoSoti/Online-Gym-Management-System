class SupplementManager {
  constructor() {
    // Constants
    this.API_URL = "http://localhost:3000/api/supplements";
    this.LOW_STOCK_THRESHOLD = 9;
    this.CRITICAL_LOW_THRESHOLD = 10;
    this.POLLING_INTERVAL = 5000;

    // State
    this.currentId = null;
    this.currentSupplements = [];
    this.isPolling = true;
    this.lowStockNotified = new Set();

    // DOM Elements
    this.modal = document.getElementById("supplementModal");
    this.form = document.getElementById("supplementForm");
    this.table = document.getElementById("supplementsTable");
    this.modalTitle = document.getElementById("modalTitle");

    // Initialize app
    this.initializeEventListeners();
    this.loadSupplements(true);
    this.startPolling();
  }

  // ========== Initialization ==========

  initializeEventListeners() {
    // Modal buttons
    document.getElementById("openModalBtn").addEventListener("click", () => this.openModal());
    document.getElementById("closeModalBtn").addEventListener("click", () => this.closeModal());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Form submission
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Table action handlers
    this.table.addEventListener("click", (e) => this.handleTableClick(e));

    // Visibility polling control
    document.addEventListener("visibilitychange", () => {
      document.hidden ? this.stopPolling() : (this.startPolling(), this.loadSupplements());
    });
  }

  handleTableClick(e) {
    const row = e.target.closest("tr");
    if (!row) return;

    if (e.target.classList.contains("edit-btn")) this.editSupplement(row);
    else if (e.target.classList.contains("delete-btn")) this.deleteSupplement(row);
  }

  // ========== Polling ==========

  startPolling() {
    this.isPolling = true;
    this.poll();
  }

  stopPolling() {
    this.isPolling = false;
  }

  async poll() {
    if (!this.isPolling) return;
    await this.loadSupplements();
    setTimeout(() => this.poll(), this.POLLING_INTERVAL);
  }

  // ========== Modal ==========

  openModal(supplement = null) {
    this.stopPolling();
    this.currentId = supplement?.id || null;
    this.modalTitle.textContent = supplement ? "Edit Supplement" : "Add Supplement";

    document.getElementById("name").value = supplement?.supplement_name || "";
    document.getElementById("quantity").value = supplement?.quantity || "";
    document.getElementById("price").value = supplement?.price || "";

    this.modal.classList.remove("hidden");
  }

  closeModal() {
    this.modal.classList.add("hidden");
    this.form.reset();
    this.currentId = null;
    this.startPolling();
  }

  // ========== Data Handling ==========

  async loadSupplements(isInitialLoad = false) {
    try {
      const response = await fetch(this.API_URL);
      const newSupplements = await response.json();

      const hasChanges = JSON.stringify(this.currentSupplements) !== JSON.stringify(newSupplements);
      if (hasChanges || isInitialLoad) {
        this.updateTable(newSupplements);
        const prevSupplements = [...this.currentSupplements];
        this.currentSupplements = newSupplements;

        this.checkLowStockWithUpdates(prevSupplements, newSupplements);

        if (hasChanges && !isInitialLoad && !this.modal.classList.contains("hidden")) {
          this.showUpdateNotification();
        }
      }
    } catch (error) {
      console.error("Failed to load supplements:", error);
      if (isInitialLoad) this.showError("Failed to load supplements");
    }
  }

  updateTable(supplements) {
    this.table.innerHTML = supplements.map(this.createTableRow.bind(this)).join("");
  }

  checkLowStockWithUpdates(prev, current) {
    const newLow = current.filter((supp) => {
      const prevItem = prev.find((p) => p.id === supp.id);
      return (
        supp.quantity <= this.LOW_STOCK_THRESHOLD &&
        (!prevItem || supp.quantity < prevItem.quantity)
      );
    });
    // Logic reserved for possible future notification feature
  }

  // ========== Table Row Rendering ==========

  createTableRow(supplement) {
    const stockClass = supplement.quantity <= this.LOW_STOCK_THRESHOLD
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";

    const criticalLowClass = supplement.quantity < this.CRITICAL_LOW_THRESHOLD
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";

    return `
      <tr data-id="${supplement.id}" class="group hover:bg-slate-50 border-b last:border-b-0 transition-all">
        <td class="px-6 py-4">
          <div class="flex items-center space-x-4">
            <div class="h-12 w-12 flex-shrink-0 bg-indigo-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">${supplement.supplement_name}</div>
              <div class="text-xs text-slate-500 group-hover:text-slate-700">Supplement ID: ${supplement.id}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 inline-flex text-xs font-semibold rounded-full ${stockClass}">
            ${supplement.quantity} Available
          </span>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 inline-flex text-xs font-semibold rounded-full ${criticalLowClass}">
            ${supplement.quantity < this.CRITICAL_LOW_THRESHOLD ? "Critical Low" : ""}
          </span>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
            ${supplement.price} ₱
          </span>
        </td>
        <td class="px-6 py-4 text-sm font-medium">
          <button class="edit-btn mr-4 text-indigo-500 border-2 border-indigo-500 px-2 py-2 hover:bg-indigo-500 hover:text-white transition-all">
            ✏️
          </button>
          <button class="delete-btn text-rose-500 border-2 border-rose-500 px-2 py-2 hover:bg-rose-500 hover:text-white transition-all">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }

  // ========== CRUD ==========

  async handleSubmit(e) {
    e.preventDefault();

    const formData = {
      supplement_name: document.getElementById("name").value,
      quantity: parseInt(document.getElementById("quantity").value),
      price: parseFloat(document.getElementById("price").value),
    };

    const url = this.currentId ? `${this.API_URL}/${this.currentId}` : this.API_URL;
    const method = this.currentId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save supplement");

      const newData = await response.json();
      const prevState = [...this.currentSupplements];

      this.checkLowStockWithUpdates(prevState, [newData]);
      await this.loadSupplements();

      this.closeModal();
      this.showSuccess(`Supplement ${this.currentId ? "updated" : "added"} successfully`);
    } catch (error) {
      this.showError(error.message);
    }
  }

  async deleteSupplement(row) {
    const id = row.dataset.id;
    const name = row.querySelector(".text-slate-900").textContent;

    if (await this.confirmDelete(name)) {
      try {
        const response = await fetch(`${this.API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete supplement");

        await this.loadSupplements();
        this.showSuccess("Supplement deleted successfully");
      } catch (error) {
        this.showError(error.message);
      }
    }
  }

  editSupplement(row) {
    const id = row.dataset.id;
    const name = row.querySelector(".text-slate-900").textContent;
    const quantity = parseInt(row.querySelectorAll(".rounded-full")[0].textContent);
    const price = parseFloat(row.querySelectorAll(".rounded-full")[1].textContent);

    this.openModal({ id, supplement_name: name, quantity, price });
  }

  // ========== Notifications ==========

  async confirmDelete(name) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete supplement "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Delete",
    });
    return result.isConfirmed;
  }

  showSuccess(message) {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: message,
      timer: 4000,
      showConfirmButton: false,
    });
  }

  showError(message) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
    });
  }

  showUpdateNotification() {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "Inventory Updated",
      text: "The supplement list has been updated.",
      showConfirmButton: false,
      timer: 2000,
    });
  }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => new SupplementManager());

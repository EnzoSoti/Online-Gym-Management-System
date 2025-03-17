class SupplementManager {
  constructor() {
    this.API_URL = "http://localhost:3000/api/supplements";
    this.modal = document.getElementById("supplementModal");
    this.form = document.getElementById("supplementForm");
    this.table = document.getElementById("supplementsTable");
    this.modalTitle = document.getElementById("modalTitle");
    this.currentId = null;
    this.LOW_STOCK_THRESHOLD = 9;
    this.CRITICAL_LOW_THRESHOLD = 10; // New threshold for critical low
    this.POLLING_INTERVAL = 5000; // 5 seconds polling interval
    this.currentSupplements = []; // Store current state
    this.isPolling = true; // Flag to control polling
    this.lowStockNotified = new Set(); // Track which items have been notified

    this.initializeEventListeners();
    this.loadSupplements(true); // Initial load
    this.startPolling();
  }

  initializeEventListeners() {
    // Modal controls
    document
      .getElementById("openModalBtn")
      .addEventListener("click", () => this.openModal());
    document
      .getElementById("closeModalBtn")
      .addEventListener("click", () => this.closeModal());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Form submission
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Table actions
    this.table.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;

      if (e.target.classList.contains("edit-btn")) {
        this.editSupplement(row);
      } else if (e.target.classList.contains("delete-btn")) {
        this.deleteSupplement(row);
      }
    });

    // Add visibility change handler
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stopPolling();
      } else {
        this.startPolling();
        this.loadSupplements(); // Refresh data when page becomes visible
      }
    });
  }

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

  openModal(supplement = null) {
    this.stopPolling(); // Stop polling when modal is open
    this.currentId = supplement ? supplement.id : null;
    this.modalTitle.textContent = supplement
      ? "Edit Supplement"
      : "Add Supplement";

    document.getElementById("name").value = supplement
      ? supplement.supplement_name
      : "";
    document.getElementById("quantity").value = supplement
      ? supplement.quantity
      : "";
    document.getElementById("price").value = supplement ? supplement.price : "";

    this.modal.classList.remove("hidden");
  }

  closeModal() {
    this.modal.classList.add("hidden");
    this.form.reset();
    this.currentId = null;
    this.startPolling(); // Resume polling when modal is closed
  }

  async loadSupplements(isInitialLoad = false) {
    try {
      const response = await fetch(this.API_URL);
      const newSupplements = await response.json();

      // Check if data has changed
      const hasChanges =
        JSON.stringify(this.currentSupplements) !==
        JSON.stringify(newSupplements);

      if (hasChanges || isInitialLoad) {
        this.table.innerHTML = newSupplements
          .map((supplement) => this.createTableRow(supplement))
          .join("");

        // Update current state before checking low stock
        const previousSupplements = [...this.currentSupplements];
        this.currentSupplements = newSupplements;

        // Check for low stock items with immediate notification
        this.checkLowStockWithUpdates(previousSupplements, newSupplements);

        // Show update notification if it's not the initial load
        if (
          hasChanges &&
          !isInitialLoad &&
          !this.modal.classList.contains("hidden")
        ) {
          this.showUpdateNotification();
        }
      }
    } catch (error) {
      console.error("Failed to load supplements:", error);
      // Only show error if it's the initial load
      if (isInitialLoad) {
        this.showError("Failed to load supplements");
      }
    }
  }

  checkLowStockWithUpdates(previousSupplements, newSupplements) {
    // Find items that are now below threshold
    const newLowStockItems = newSupplements.filter((supp) => {
      const prevSupp = previousSupplements.find((ps) => ps.id === supp.id);
      return (
        supp.quantity <= this.LOW_STOCK_THRESHOLD &&
        (!prevSupp ||
          prevSupp.quantity > this.LOW_STOCK_THRESHOLD ||
          (supp.quantity < prevSupp.quantity &&
            prevSupp.quantity <= this.LOW_STOCK_THRESHOLD))
      );
    });

    // No need to call showLowStockNotification since it's removed
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

  createTableRow(supplement) {
    const stockClass =
      supplement.quantity <= this.LOW_STOCK_THRESHOLD
        ? "bg-red-100 text-red-800"
        : "bg-green-100 text-green-800";

    const criticalLowClass =
      supplement.quantity < this.CRITICAL_LOW_THRESHOLD
        ? "bg-red-100 text-red-800"
        : "bg-green-100 text-green-800";

    return `
        <tr data-id="${
          supplement.id
        }" class="group transition-all duration-300 ease-in-out hover:bg-slate-50 hover:shadow-sm border-b border-slate-100 last:border-b-0"> 
            <td class="px-6 py-4 whitespace-nowrap"> 
                <div class="flex items-center space-x-4"> 
                    <div class="h-12 w-12 flex-shrink-0 bg-indigo-100 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"> 
                        <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/> 
                        </svg> 
                    </div> 
                    <div> 
                        <div class="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">${
                          supplement.supplement_name
                        }</div> 
                        <div class="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">Supplement ID: ${
                          supplement.id
                        }</div> 
                    </div> 
                </div> 
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockClass}">
                    ${supplement.quantity} Available
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${criticalLowClass}">
                    ${
                      supplement.quantity < this.CRITICAL_LOW_THRESHOLD
                        ? "Critical Low"
                        : ""
                    }
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    ${supplement.price} ₱
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="edit-btn inline-flex items-center border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white px-2 py-2 transition-all duration-200 text-sm font-medium mr-4" onclick="renewMembership(this)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>

                <button class="delete-btn inline-flex items-center border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white px-2 py-2 transition-all duration-200 text-sm font-medium mr-4" onclick="renewMembership(this)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </td>
        </tr>
        `;
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = {
      supplement_name: document.getElementById("name").value,
      quantity: parseInt(document.getElementById("quantity").value),
      price: parseFloat(document.getElementById("price").value),
    };

    try {
      const url = this.currentId
        ? `${this.API_URL}/${this.currentId}`
        : this.API_URL;
      const method = this.currentId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save supplement");

      // Store previous state before loading new data
      const previousSupplements = [...this.currentSupplements];

      // Load new data and check for low stock
      const newSupplements = await response.json();
      this.checkLowStockWithUpdates(previousSupplements, [newSupplements]);

      await this.loadSupplements();
      this.closeModal();
      this.showSuccess(
        `Supplement ${this.currentId ? "updated" : "added"} successfully`
      );
    } catch (error) {
      this.showError(error.message);
    }
  }

  async deleteSupplement(row) {
    const id = row.dataset.id;
    const name = row.querySelector(".text-slate-900").textContent;

    if (await this.confirmDelete(name)) {
      try {
        const response = await fetch(`${this.API_URL}/${id}`, {
          method: "DELETE",
        });

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
    const quantityText = row.querySelector(".rounded-full").textContent;
    const priceText = row.querySelectorAll(".rounded-full")[1].textContent;

    const quantity = parseInt(quantityText);
    const price = parseFloat(priceText);

    this.openModal({
      id: id,
      supplement_name: name,
      quantity: quantity,
      price: price,
    });
  }

  async confirmDelete(name) {
    return await Swal.fire({
      title: "Are you sure?",
      text: `Delete supplement "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Delete",
    }).then((result) => result.isConfirmed);
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
}

// Initialize the supplement manager when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SupplementManager();
});

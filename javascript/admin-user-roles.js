// Sample data for demonstration
let roles = [
  {
    id: 1,
    name: "Administrator",
    description: "Main module: Permissions module",
    users: 1,
  },
  {
    id: 2,
    name: "Front Desk",
    description: "Main module: Inquiry module",
    users: 1,
  },
  {
    id: 3,
    name: "Cashier",
    description: "Main module: Product Sale, and Payment modules",
    users: 1,
  },
];

let users = [
  { id: 1, username: "Jed", roles: [1] },
  { id: 2, username: "Ariel", roles: [2] },
  { id: 3, username: "Enzo", roles: [3] },
];

let permissions = [
  { id: 1, name: "inquiry", description: "Access Inquiry Module" },
  { id: 2, name: "product_sale", description: "Access Product Sale Module" },
  { id: 3, name: "payment", description: "Access Payment Module" },
  { id: 4, name: "monitoring", description: "Access Monitoring Module" },
  { id: 5, name: "export", description: "Access Export Module" },
];

// Role permissions (which permissions are assigned to which roles)
let rolePermissions = {
  1: [4, 5], // Default permissions for Administrator is only Monitoring and Export
  2: [1, 4, 5], // Front Desk main module is Inquiry
  3: [2, 3, 4, 5], // Cashier main modules are Product Sale and Payment
};

// DOM elements
const navItems = document.querySelectorAll(".nav-item");
const tabContents = document.querySelectorAll(".tab-content");
const roleModal = document.getElementById("role-modal");
const assignRoleModal = document.getElementById("assign-role-modal");
const addRoleBtn = document.getElementById("add-role-btn");
const cancelRoleBtn = document.getElementById("cancel-role-btn");
const cancelAssignBtn = document.getElementById("cancel-assign-btn");
const closeButtons = document.querySelectorAll(".close");
const roleForm = document.getElementById("role-form");
const assignRoleForm = document.getElementById("assign-role-form");
const roleSearchInput = document.getElementById("role-search");
const userSearchInput = document.getElementById("user-search");

// Tab navigation
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const tabId = item.getAttribute("data-tab");

    // Update active tab
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    // Show selected tab content
    tabContents.forEach((content) => {
      content.classList.remove("active");
      if (content.id === tabId) {
        content.classList.add("active");
      }
    });
  });
});

// Initialize tables
function initTables() {
  populateRolesTable();
  //populateUsersTable();
}

// Populate roles table
function populateRolesTable() {
  const rolesTableBody = document.querySelector("#roles-table tbody");
  rolesTableBody.innerHTML = "";

  roles.forEach((role) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                  <td>${role.name}</td>
                  <td>${role.description}</td>
                  <td>${role.users}</td>
                  <td class="action-buttons">
                    <button class="edit-btn inline-flex items-center border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white px-2 py-2 transition-all duration-200 text-sm font-medium mr-1" data-id="${role.id}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button class="delete-btn inline-flex items-center border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white px-2 py-2 transition-all duration-200 text-sm font-medium mr-1" data-id="${role.id}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                  </td>
              `;
    rolesTableBody.appendChild(row);
  });

  // Add event listeners to edit and delete buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const roleId = parseInt(this.getAttribute("data-id"));
      openEditRoleModal(roleId);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const roleId = parseInt(this.getAttribute("data-id"));
      deleteRole(roleId);
    });
  });
}

// Populate users table
function populateUsersTable() {
  const usersTableBody = document.querySelector("#users-table tbody");
  usersTableBody.innerHTML = "";

  users.forEach((user) => {
    const row = document.createElement("tr");
    const userRoles = user.roles
      .map((roleId) => {
        const role = roles.find((r) => r.id === roleId);
        return `<span class="badge">${role ? role.name : "Unknown"}</span>`;
      })
      .join("");

    row.innerHTML = `
                  <td>${user.username}</td>
                  <td>${user.email}</td>
                  <td>${userRoles}</td>
                  <td>
                      <button class="assign-role" data-id="${user.id}">Assign Roles</button>
                  </td>
              `;
    usersTableBody.appendChild(row);
  });

  // Add event listeners to assign role buttons
  document.querySelectorAll(".assign-role").forEach((btn) => {
    btn.addEventListener("click", function () {
      const userId = parseInt(this.getAttribute("data-id"));
      openAssignRoleModal(userId);
    });
  });
}

// Role modal functions
function openAddRoleModal() {
  document.getElementById("role-modal-title").textContent = "Add New Role";
  document.getElementById("role-id").value = "";
  document.getElementById("role-name").value = "";
  document.getElementById("role-description").value = "";

  // Reset permissions
  const permissionsContainer = document.getElementById("permissions-container");
  permissionsContainer.innerHTML = "";

  permissions.forEach((permission) => {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.innerHTML = `
                  <label>
                      <input type="checkbox" name="permissions" value="${permission.id}">
                      ${permission.description}
                  </label>
              `;
    permissionsContainer.appendChild(checkboxDiv);
  });

  roleModal.style.display = "block";
}

function openEditRoleModal(roleId) {
  const role = roles.find((r) => r.id === roleId);
  if (!role) return;

  document.getElementById("role-modal-title").textContent = "Edit Role";
  document.getElementById("role-id").value = role.id;
  document.getElementById("role-name").value = role.name;
  document.getElementById("role-description").value = role.description;

  // Set permissions
  const permissionsContainer = document.getElementById("permissions-container");
  permissionsContainer.innerHTML = "";

  permissions.forEach((permission) => {
    const isChecked =
      rolePermissions[role.id] &&
      rolePermissions[role.id].includes(permission.id);

    const checkboxDiv = document.createElement("div");
    checkboxDiv.innerHTML = `
                  <label>
                      <input type="checkbox" name="permissions" value="${
                        permission.id
                      }" ${isChecked ? "checked" : ""}>
                      ${permission.description}
                  </label>
              `;
    permissionsContainer.appendChild(checkboxDiv);
  });

  roleModal.style.display = "block";
}

function closeRoleModal() {
  roleModal.style.display = "none";
}

function saveRole(event) {
  event.preventDefault();

  const roleId = document.getElementById("role-id").value;
  const roleName = document.getElementById("role-name").value;
  const roleDescription = document.getElementById("role-description").value;

  // Get selected permissions
  const selectedPermissions = Array.from(
    document.querySelectorAll('input[name="permissions"]:checked')
  ).map((checkbox) => parseInt(checkbox.value));

  if (roleId) {
    // Update existing role
    const roleIndex = roles.findIndex((r) => r.id === parseInt(roleId));
    if (roleIndex !== -1) {
      roles[roleIndex].name = roleName;
      roles[roleIndex].description = roleDescription;
      rolePermissions[parseInt(roleId)] = selectedPermissions;
    }
  } else {
    // Add new role
    const newRoleId =
      roles.length > 0 ? Math.max(...roles.map((r) => r.id)) + 1 : 1;
    roles.push({
      id: newRoleId,
      name: roleName,
      description: roleDescription,
      users: 0,
    });
    rolePermissions[newRoleId] = selectedPermissions;
  }

  // Refresh table and close modal
  populateRolesTable();
  closeRoleModal();
}

function deleteRole(roleId) {
  if (confirm("Are you sure you want to delete this role?")) {
    // Remove role from roles array
    roles = roles.filter((role) => role.id !== roleId);

    // Remove role from role permissions
    delete rolePermissions[roleId];

    // Remove role from users
    users.forEach((user) => {
      user.roles = user.roles.filter((id) => id !== roleId);
    });

    // Update user counts for roles
    updateRoleUserCounts();

    // Refresh tables
    populateRolesTable();
    //populateUsersTable();
  }
}

// Assign role modal functions
function openAssignRoleModal(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  document.getElementById("user-id").value = user.id;
  document.getElementById("user-name-display").textContent = user.username;
  document.getElementById("user-email-display").textContent = user.email;

  // Set roles
  const rolesContainer = document.getElementById("roles-container");
  rolesContainer.innerHTML = "";

  roles.forEach((role) => {
    const isChecked = user.roles.includes(role.id);

    const checkboxDiv = document.createElement("div");
    checkboxDiv.innerHTML = `
                  <label>
                      <input type="checkbox" name="user-roles" value="${
                        role.id
                      }" ${isChecked ? "checked" : ""}>
                      ${role.name} - ${role.description}
                  </label>
              `;
    rolesContainer.appendChild(checkboxDiv);
  });

  assignRoleModal.style.display = "block";
}

function closeAssignRoleModal() {
  assignRoleModal.style.display = "none";
}

function saveUserRoles(event) {
  event.preventDefault();

  const userId = parseInt(document.getElementById("user-id").value);

  // Get selected roles
  const selectedRoles = Array.from(
    document.querySelectorAll('input[name="user-roles"]:checked')
  ).map((checkbox) => parseInt(checkbox.value));

  // Update user roles
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].roles = selectedRoles;
  }

  // Update user counts for roles
  updateRoleUserCounts();

  // Refresh tables and close modal
  populateRolesTable();
  //populateUsersTable();
  closeAssignRoleModal();
}

// Update role user counts
function updateRoleUserCounts() {
  // Reset user counts
  roles.forEach((role) => {
    role.users = 0;
  });

  // Count users per role
  users.forEach((user) => {
    user.roles.forEach((roleId) => {
      const role = roles.find((r) => r.id === roleId);
      if (role) {
        role.users += 1;
      }
    });
  });
}

// Search functions
function setupSearch() {
  roleSearchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll("#roles-table tbody tr");

    rows.forEach((row) => {
      const roleName = row.cells[0].textContent.toLowerCase();
      const roleDescription = row.cells[1].textContent.toLowerCase();

      if (
        roleName.includes(searchTerm) ||
        roleDescription.includes(searchTerm)
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  if (userSearchInput) {
    userSearchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const rows = document.querySelectorAll("#users-table tbody tr");

      rows.forEach((row) => {
        const username = row.cells[0].textContent.toLowerCase();
        const email = row.cells[1].textContent.toLowerCase();

        if (username.includes(searchTerm) || email.includes(searchTerm)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }
}

// Event listeners
function setupEventListeners() {
  // Add role button
  addRoleBtn.addEventListener("click", openAddRoleModal);

  // Cancel buttons
  cancelRoleBtn.addEventListener("click", closeRoleModal);
  cancelAssignBtn.addEventListener("click", closeAssignRoleModal);

  // Close buttons
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      roleModal.style.display = "none";
      assignRoleModal.style.display = "none";
    });
  });

  // Form submissions
  roleForm.addEventListener("submit", saveRole);
  assignRoleForm.addEventListener("submit", saveUserRoles);

  // Close modals when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === roleModal) {
      closeRoleModal();
    }
    if (event.target === assignRoleModal) {
      closeAssignRoleModal();
    }
  });
}

// Initialize
function init() {
  initTables();
  setupSearch();
  setupEventListeners();
}

// Run initialization when document is loaded
document.addEventListener("DOMContentLoaded", init);

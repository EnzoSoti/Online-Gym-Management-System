// DOM Elements
const addMemberBtn = document.getElementById("addMemberBtn");
const addMemberModal = document.getElementById("addMemberModal");
const memberForm = document.getElementById("memberForm");
const closeModalBtn = document.getElementById("closeModalBtn");
const searchInput = document.getElementById("memberSearch");
let selectedRow = null;
let allMembers = [];
let lastPolledData = null;
const POLLING_INTERVAL = 10000; // Poll every 10 seconds

// Notification System
class NotificationSystem {
  constructor() {
    this.hasPermission = false;
    this.init();
  }

  async init() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === "granted";
    }
  }

  async notify(title, options = {}) {
    // Always show SweetAlert2 notification
    Swal.fire({
      icon: options.icon || "info",
      title: title,
      text: options.body || "",
      showConfirmButton: false,
      timer: 3000,
      position: "top-end",
      toast: true,
    });

    // Show system notification if permitted
    if (this.hasPermission) {
      new Notification(title, {
        body: options.body,
        icon: "/img/Fitworx logo.jpg", // Add your notification icon path
      });
    }
  }
}

const notificationSystem = new NotificationSystem();

// Load members on page load and start polling
document.addEventListener("DOMContentLoaded", () => {
  loadMembers();
  startPolling();
});

// Add search event listener
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredMembers = allMembers.filter(
      (member) =>
        member.member_name.toLowerCase().includes(searchTerm) ||
        member.type.toLowerCase().includes(searchTerm) ||
        member.status.toLowerCase().includes(searchTerm)
    );
    renderMembers(filteredMembers);
  });
}

function playSound(soundId) {
  const sound = document.getElementById(soundId);
  sound.play();
}

// Polling function with notification for changes
function startPolling() {
  setInterval(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/monthly-members`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newData = await response.json();

      // Check if data has changed before updating
      if (JSON.stringify(newData) !== JSON.stringify(lastPolledData)) {
        // Detect changes
        if (lastPolledData) {
          const added = newData.filter(
            (member) => !lastPolledData.find((old) => old.id === member.id)
          );
          const deleted = lastPolledData.filter(
            (member) => !newData.find((current) => current.id === member.id)
          );
          const updated = newData.filter((member) => {
            const oldMember = lastPolledData.find(
              (old) => old.id === member.id
            );
            return (
              oldMember && JSON.stringify(member) !== JSON.stringify(oldMember)
            );
          });

          // Notify of changes made by other users using Toastify
          if (added.length > 0) {
            Toastify({
              text: `${added.length} new member(s) have been added`,
              duration: 3000,
              close: true,
              gravity: "top",
              position: "right",
              backgroundColor: "#4CAF50", // Success green
            }).showToast();
          }
          if (updated.length > 0) {
            Toastify({
              text: `${updated.length} member(s) have been updated`,
              duration: 3000,
              close: true,
              gravity: "top",
              position: "right",
              backgroundColor: "#2196F3", // Info blue
            }).showToast();
          }
          if (deleted.length > 0) {
            Toastify({
              text: `${deleted.length} member(s) have been removed`,
              duration: 3000,
              close: true,
              gravity: "top",
              position: "right",
              backgroundColor: "#FF9800", // Warning orange
            }).showToast();
          }
        }

        allMembers = newData;
        lastPolledData = newData;

        // If search input has value, filter the new data
        if (searchInput && searchInput.value) {
          filterMembers();
        } else {
          renderMembers(allMembers);
        }
      }
    } catch (error) {
      console.error("Polling error:", error);
      notificationSystem.notify("Connection Error", {
        body: "Failed to fetch latest updates",
        icon: "error",
      });
    }
  }, POLLING_INTERVAL);
}

// Modal functions
function openMemberModal() {
  if (addMemberModal) {
    addMemberModal.classList.remove("hidden");
  }
}

function closeMemberModal() {
  if (addMemberModal) {
    addMemberModal.classList.add("hidden");
    selectedRow = null;
    if (memberForm) {
      memberForm.reset();
    }
  }
}

// Event listeners
if (addMemberBtn) {
  addMemberBtn.addEventListener("click", openMemberModal);
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeMemberModal);
}

// Filter members based on search input
function filterMembers() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredMembers = allMembers.filter((member) =>
    member.member_name.toLowerCase().includes(searchTerm)
  );
  renderMembers(filteredMembers);
}

// Render members to table
async function renderMembers(members) {
  const memberTableBody = document.getElementById("memberTableBody");

  if (!memberTableBody) {
    console.error("Table body element not found");
    return;
  }
  // Store current scroll position
  const scrollPos = memberTableBody.parentElement.scrollTop;
  memberTableBody.innerHTML = "";

  for (const member of members) {
    const endDate = new Date(member.end_date);
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft < 0 && member.status === "Active") {
      try {
        const response = await fetch(
          `${API_BASE_URL}/monthly-members/${member.id}/update-status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "Inactive",
            }),
          }
        );

        if (response.ok) {
          member.status = "Inactive";
          notificationSystem.notify("Status Updated", {
            body: `${member.member_name}'s membership has expired and status has been set to inactive`,
            icon: "warning",
          });
        } else {
          throw new Error("Failed to update member status");
        }
      } catch (error) {
        console.error("Error updating member status:", error);
      }
    }

    let profilePictureUrl = "";
    try {
      const response = await fetch(
        `${API_BASE_URL}/monthly-members/${member.id}/profile-picture`
      );
      if (response.ok) {
        const blob = await response.blob();
        profilePictureUrl = URL.createObjectURL(blob);
      } else {
        console.error("Failed to fetch profile picture for member:", member.id);
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }

    const row = memberTableBody.insertRow();
    row.dataset.id = member.id;
    row.classList.add(
      "hover:bg-gradient-to-r",
      "hover:from-blue-50",
      "hover:to-indigo-50",
      "transition-all",
      "duration-300",
      "ease-in-out"
    );

    row.innerHTML = `
            <td class="px-4 py-2 whitespace-nowrap">
                <div class="relative group">
                    <div class="h-12 w-12 rounded-full overflow-hidden shadow-md transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                        <img class="h-full w-full object-cover profile-picture" 
                             src="${profilePictureUrl}" 
                             alt="Profile Picture">
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
            </td>
            <td class="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 tracking-tight">
                ${member.member_name}
            </td>
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700 font-medium">${
              member.type
            }</td>
            <td class="px-4 py-2 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs font-bold uppercase rounded-full shadow-sm ${
                  member.status === "Active"
                    ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300"
                    : member.status === "Inactive"
                    ? "bg-rose-100 text-rose-900 ring-1 ring-rose-300"
                    : "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                }">${member.status}</span>
            </td>
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${new Date(
              member.start_date
            ).toLocaleDateString()}</td>
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${new Date(
              member.end_date
            ).toLocaleDateString()}</td>
            <td class="px-4 py-2 whitespace-nowrap text-sm ${
              daysLeft < 0 ? "text-rose-700 font-bold" : "text-gray-700"
            } tracking-tight">${daysLeft}</td>
            <td class="px-4 py-2 whitespace-nowrap text-sm font-medium">
                <div class="flex items-start gap-2">
                    <button class="w-6 h-6 flex items-center justify-center bg-indigo-500 text-white hover:bg-indigo-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md group" onclick="updateMember(this)" title="Update">
                        <svg class="w-3 h-3 group-hover:animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
        
                    <button class="w-6 h-6 flex items-center justify-center bg-rose-500 text-white hover:bg-rose-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md group" onclick="deleteMember(this)" title="Delete">
                        <svg class="w-3 h-3 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
        
                    <button class="w-6 h-6 flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md group" onclick="renewMembership(this)" title="Renew">
                        <svg class="w-3 h-3 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
        
                    <button class="w-6 h-6 flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md group" onclick="verifyMember(this)" title="Verify">
                        <svg class="w-3 h-3 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
        
                    <button class="w-6 h-6 flex items-center justify-center bg-indigo-500 text-white hover:bg-indigo-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md group ${
                      member.type === "regular" ? "hidden" : ""
                    }" onclick="viewPicture(this)" title="View ID Picture">
                        <svg class="w-3 h-3 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>

                    <button class="w-6 h-6 flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md group ${
                      member.status === "Active" ? "" : "hidden"
                    }" onclick="sendEmailNotification(this)" title="Send Email Notification">
                        <svg class="w-3 h-3 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </button>
                </div>
            </td>
        `;

    row.addEventListener("click", (event) => {
      if (!event.target.closest("button")) {
        showFullDetailsModal(member);
      }
    });

    const profilePicture = row.querySelector(".profile-picture");
    if (profilePicture) {
      profilePicture.addEventListener("click", () => {
        showEnlargedPicture(profilePictureUrl);
      });
    }
  }

  memberTableBody.parentElement.scrollTop = scrollPos;
}

async function showFullDetailsModal(member) {
  const modal = document.getElementById("fullDetailsModal");
  const modalContent = document.getElementById("fullDetailsModalContent");

  if (!modal || !modalContent) {
    console.error("Modal elements not found");
    return;
  }

  modalContent.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl p-6 max-w-xl mx-auto">
            <div class="flex justify-between items-center border-b pb-4 mb-6">
                <h2 class="text-2xl font-semibold text-gray-800">Member Details</h2>
                <span class="px-3 py-1 rounded-full text-sm font-medium ${
                  member.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : member.status === "Inactive"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }">${member.status}</span>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500 mb-1">Member Name</p>
                    <p class="font-medium text-gray-800">${
                      member.member_name
                    }</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Membership Type</p>
                    <p class="font-medium text-gray-800">${member.type}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Start Date</p>
                    <p class="font-medium text-gray-800">${new Date(
                      member.start_date
                    ).toLocaleDateString()}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">End Date</p>
                    <p class="font-medium text-gray-800">${new Date(
                      member.end_date
                    ).toLocaleDateString()}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Days Remaining</p>
                    <p class="font-medium text-blue-600">${Math.ceil(
                      (new Date(member.end_date) - new Date()) /
                        (1000 * 3600 * 24)
                    )} days</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Amount Paid</p>
                    <p class="font-medium text-green-600">₱${
                      member.amount_paid || "N/A"
                    }</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">GCash Reference</p>
                    <p class="font-medium text-gray-800">${
                      member.gcash_ref || "N/A"
                    }</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">GCash Name</p>
                    <p class="font-medium text-gray-800">${
                      member.gcash_name || "N/A"
                    }</p>
                </div>
                <div className="col-span-2">
                    <p class="text-sm text-gray-500 mb-1">Email</p>
                    <p class="font-medium text-gray-800">${
                      member.email || "N/A"
                    }</p>
                </div>
            </div>

            <div class="mt-6 flex justify-end">
                <button id="closeFullDetailsModal" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  document
    .getElementById("closeFullDetailsModal")
    .addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    });
}

async function sendEmailNotification(btn) {
  const row = btn.closest("tr");
  const memberId = row.dataset.id;
  const memberName = row.cells[1].textContent.trim();

  const result = await Swal.fire({
    title: "Send Email Notification",
    text: `Are you sure you want to send an email notification to ${memberName}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, send",
    cancelButtonText: "No, cancel",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/monthly-members/${memberId}/send-email`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Failed to send email notification");
      Toastify({
        text: `Successfully sent email notification to ${memberName}`,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#4CAF50",
      }).showToast();
      
      playSound("success-sound");
    } catch (error) {
      console.error("Error:", error);
      notificationSystem.notify("Error", {
        body: error.message,
        icon: "error",
      });
    }
  }
}

function showEnlargedPicture(imageUrl) {
  const modal = document.getElementById("enlargedPictureModal");
  const enlargedPicture = document.getElementById("enlargedPicture");
  enlargedPicture.src = imageUrl;
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("visible");
  }, 10); // Small delay to ensure the transition starts after the modal is displayed
}

document
  .getElementById("closeEnlargedPicture")
  .addEventListener("click", () => {
    const modal = document.getElementById("enlargedPictureModal");
    modal.classList.remove("visible");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300); // Wait for the transition to complete before hiding the modal
  });

async function loadMembers() {
  try {
    const response = await fetch(`${API_BASE_URL}/monthly-members`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allMembers = await response.json();
    lastPolledData = [...allMembers]; // Store initial data for polling comparison
    renderMembers(allMembers);
  } catch (error) {
    console.error("Error loading members:", error);
    notificationSystem.notify("Error Loading Members", {
      body: "Failed to load member data",
      icon: "error",
    });
  }
}

// Sorting functions
function sortMembersByStatus(status) {
  const filteredMembers = allMembers.filter(
    (member) => member.status === status
  );
  renderMembers(filteredMembers);
}

// Event listeners for sort buttons
document
  .getElementById("sortActiveBtn")
  .addEventListener("click", () => sortMembersByStatus("Active"));
document
  .getElementById("sortInactiveBtn")
  .addEventListener("click", () => sortMembersByStatus("Inactive"));
document
  .getElementById("sortPendingBtn")
  .addEventListener("click", () => sortMembersByStatus("Pending"));
document.getElementById("displayAllBtn").addEventListener("click", () => {
  renderMembers(allMembers);
});

// Handle member type change
function handleMemberTypeChange() {
  const memberType = document.getElementById("memberType");
  const schoolIdContainer = document.getElementById("schoolIdContainer");
  const schoolIdInput = document.getElementById("school_id_picture");

  if (memberType.value === "Student") {
    schoolIdContainer.classList.remove("hidden");
    schoolIdInput.required = true;
  } else {
    schoolIdContainer.classList.add("hidden");
    schoolIdInput.required = false;
    // Clear school ID input and preview when switching to Regular
    schoolIdInput.value = "";
    const schoolIdPreview = document.getElementById("school_id_preview");
    schoolIdPreview.classList.add("hidden");
    schoolIdPreview.querySelector("img").src = "";
  }
}

// Image preview handlers with proper URL cleanup
function setupImagePreviews() {
  const schoolIdInput = document.getElementById("school_id_picture");
  const profileInput = document.getElementById("profile_picture");
  const schoolIdPreview = document
    .getElementById("school_id_preview")
    .querySelector("img");
  const profilePreview = document
    .getElementById("profile_preview")
    .querySelector("img");

  function handlePreview(file, previewElement, previewContainer) {
    // Revoke previous object URL if it exists
    if (previewElement.src) {
      URL.revokeObjectURL(previewElement.src);
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      previewElement.src = objectUrl;
      previewContainer.classList.remove("hidden");
    } else {
      previewElement.src = "";
      previewContainer.classList.add("hidden");
    }
  }

  schoolIdInput?.addEventListener("change", (e) => {
    handlePreview(
      e.target.files[0],
      schoolIdPreview,
      schoolIdPreview.parentElement
    );
  });

  profileInput?.addEventListener("change", (e) => {
    handlePreview(
      e.target.files[0],
      profilePreview,
      profilePreview.parentElement
    );
  });
}

// Clear modal function
function clearModal() {
  const form = document.getElementById("memberForm");
  const schoolIdPreview = document.getElementById("school_id_preview");
  const profilePreview = document.getElementById("profile_preview");

  // Reset form
  form.reset();

  // Clear previews and revoke object URLs
  const previews = [schoolIdPreview, profilePreview];
  previews.forEach((preview) => {
    const img = preview.querySelector("img");
    if (img.src) {
      URL.revokeObjectURL(img.src);
      img.src = "";
    }
    preview.classList.add("hidden");
  });

  // Reset member type related fields
  handleMemberTypeChange();
}

// Modified close modal function
function closeMemberModal() {
  const modal = document.getElementById("addMemberModal");
  modal.classList.add("hidden");
  clearModal();
}

// Add or Update Member
if (memberForm) {
  setupImagePreviews();

  memberForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
      const memberName = document.getElementById("memberName");
      const memberStatus = document.getElementById("memberStatus");
      const memberType = document.getElementById("memberType");
      const startDate = document.getElementById("startDate");
      const endDate = document.getElementById("endDate");
      const schoolIdPicture = document.getElementById("school_id_picture");
      const profilePicture = document.getElementById("profile_picture");

      // Validate required fields based on member type
      const isStudent = memberType.value === "Student";
      if (
        !memberName.value ||
        !memberStatus.value ||
        !memberType.value ||
        !startDate.value ||
        !endDate.value ||
        !profilePicture.files[0] ||
        (isStudent && !schoolIdPicture.files[0])
      ) {
        throw new Error("Please fill in all required fields");
      }

      const formData = new FormData();
      formData.append("member_name", memberName.value.trim());
      formData.append("status", memberStatus.value);
      formData.append("type", memberType.value);
      formData.append("start_date", startDate.value);
      formData.append("end_date", endDate.value);
      formData.append("profile_picture", profilePicture.files[0]);

      if (isStudent && schoolIdPicture.files[0]) {
        formData.append("school_id_picture", schoolIdPicture.files[0]);
      }

      const url = selectedRow
        ? `${API_BASE_URL}/monthly-members/${selectedRow.dataset.id}`
        : `${API_BASE_URL}/monthly-members`;

      const method = selectedRow ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process member");
      }

      await loadMembers();
      closeMemberModal(); // This will also clear the form

      notificationSystem.notify(
        selectedRow ? "Member Updated" : "Member Added",
        {
          body: selectedRow
            ? `Successfully updated ${memberName.value.trim()}`
            : `Successfully added ${memberName.value.trim()}`,
          icon: "success",
        }
      );
    } catch (error) {
      console.error("Form submission error:", error);
      notificationSystem.notify("Error", {
        body: error.message,
        icon: "error",
      });
    }
  });
}

function openUpdateMemberModal() {
  const updateMemberModal = document.getElementById("updateMemberModal");
  if (updateMemberModal) {
    updateMemberModal.classList.remove("hidden");
  }
}

function closeUpdateMemberModal() {
  const updateMemberModal = document.getElementById("updateMemberModal");
  if (updateMemberModal) {
    updateMemberModal.classList.add("hidden");
    selectedRow = null;
    if (updateMemberForm) {
      updateMemberForm.reset();
    }
  }
}

function updateMember(btn) {
  selectedRow = btn.closest("tr");
  const memberName = document.getElementById("updateMemberName");
  const memberType = document.getElementById("updateMemberType");
  const startDate = document.getElementById("updateStartDate");
  const endDate = document.getElementById("updateEndDate");

  if (memberName && memberType && startDate && endDate) {
    const cells = selectedRow.cells;
    memberName.value = cells[1].textContent.trim();
    memberType.value = cells[2].textContent.trim();

    const startDateStr = cells[4].textContent.trim();
    const endDateStr = cells[5].textContent.trim();

    const formatDate = (dateStr) => {
      const [month, day, year] = dateStr.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    startDate.value = formatDate(startDateStr);
    endDate.value = formatDate(endDateStr);

    openUpdateMemberModal();
  }
}

const updateMemberForm = document.getElementById("updateMemberForm");
if (updateMemberForm) {
  setupImagePreviews();

  updateMemberForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
      const memberName = document.getElementById("updateMemberName");
      const memberStatus = document.getElementById("updateMemberStatus");
      const memberType = document.getElementById("updateMemberType");
      const startDate = document.getElementById("updateStartDate");
      const endDate = document.getElementById("updateEndDate");

      if (
        !memberName.value ||
        !memberStatus.value ||
        !memberType.value ||
        !startDate.value ||
        !endDate.value
      ) {
        throw new Error("Please fill in all required fields");
      }

      const formData = new FormData();
      formData.append("member_name", memberName.value.trim());
      formData.append("status", memberStatus.value);
      formData.append("type", memberType.value);
      formData.append("start_date", startDate.value);
      formData.append("end_date", endDate.value);

      const url = `${API_BASE_URL}/monthly-members/${selectedRow.dataset.id}`;

      const response = await fetch(url, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update member");
      }

      await loadMembers();
      closeUpdateMemberModal();

      notificationSystem.notify("Member Updated", {
        body: `Successfully updated ${memberName.value.trim()}`,
        icon: "success",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      notificationSystem.notify("Error", {
        body: error.message,
        icon: "error",
      });
    }
  });
}

// Renew function
function getTodayFormatted() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function getOneMonthFromDate(dateString) {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split("T")[0];
}

async function renewMembership(btn) {
  const row = btn.closest("tr");
  const memberId = row.dataset.id;
  const cells = row.cells;

  // Get values from correct cell indices
  const memberName = cells[1].textContent.trim(); // Member name is in second column
  const memberType = cells[2].textContent.trim(); // Type is in third column
  const statusSpan = cells[3].querySelector("span"); // Status is in fourth column

  const originalData = {
    status: statusSpan ? statusSpan.textContent.trim() : "Unknown",
    start_date: cells[4].textContent.trim(), // Start date is in fifth column
    end_date: cells[5].textContent.trim(), // End date is sixth column
  };

  try {
    const today = getTodayFormatted();
    const nextMonth = getOneMonthFromDate(today);

    const memberData = {
      member_name: memberName,
      type: memberType,
      status: "Active",
      start_date: today,
      end_date: nextMonth,
    };

    // First confirmation
    const initialConfirm = await Swal.fire({
      title: "Renew Membership",
      html: `Do you want to renew membership for ${memberName}?`,
      showCancelButton: true,
      confirmButtonText: "Proceed",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
    });

    // If cancelled, don't proceed
    if (initialConfirm.dismiss === Swal.DismissReason.cancel) {
      return;
    }

    // Second confirmation
    const finalConfirm = await Swal.fire({
      title: "Are you sure?",
      html: `This will renew ${memberName}'s membership and cannot be undone`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
    });

    // If cancelled at second confirmation, don't proceed
    if (finalConfirm.dismiss === Swal.DismissReason.cancel) {
      return;
    }

    // Proceed with the renewal
    const response = await fetch(
      `${API_BASE_URL}/monthly-members/${memberId}/renew`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date: today,
          end_date: nextMonth,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to renew membership");
    }

    const data = await response.json();

    await loadMembers();

    playSound("success-sound");
    
    // Replace success SweetAlert with Toastify
    Toastify({
      text: `${memberName}'s membership has been renewed successfully. Renewal Amount: ${data.renewalAmount} Pesos`,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "#4CAF50",
    }).showToast();
    
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
      timer: 3000,
      showConfirmButton: false,
    });
  }
}

// Delete Member
async function deleteMember(btn) {
  const row = btn.closest("tr");
  const memberId = row.dataset.id;
  const memberName = row.cells[0].innerText;

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/monthly-members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete member");

      await loadMembers();
      playSound("success-sound");
      
      // Replace notification with Toastify
      Toastify({
        text: `Successfully deleted ${memberName}`,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#4CAF50",
      }).showToast();
      
    } catch (error) {
      console.error("Error:", error);
      notificationSystem.notify("Error", {
        body: error.message,
        icon: "error",
      });
    }
  }
}

// Verify Member
async function verifyMember(btn) {
  const row = btn.closest("tr");
  const memberId = row.dataset.id;
  const memberName = row.cells[0].innerText;

  const result = await Swal.fire({
    title: "Verify Member",
    text: `Are you sure you want to verify ${memberName}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, verify",
    cancelButtonText: "No, cancel",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/monthly-members/${memberId}/verify`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) throw new Error("Failed to verify member");

      await loadMembers();
      Toastify({
        text: `Successfully verified ${memberName}`,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#4CAF50",
      }).showToast();
      
      playSound("success-sound");
    } catch (error) {
      console.error("Error:", error);
      notificationSystem.notify("Error", {
        body: error.message,
        icon: "error",
      });
    }
  }
}

// View Picture
async function viewPicture(btn) {
  const row = btn.closest("tr");
  const memberId = row.dataset.id;
  const memberType = row.cells[1].innerText.trim();

  if (memberType === "regular") {
    Swal.fire({
      icon: "info",
      title: "No ID Required",
      text: "Regular members do not need to add an ID.",
      confirmButtonText: "OK",
    });
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/monthly-members/${memberId}/picture`
    );
    if (!response.ok) {
      throw new Error("Failed to retrieve picture");
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    Swal.fire({
      title: "Student ID Picture",
      imageUrl: imageUrl,
      imageAlt: "Student ID Picture",
      showConfirmButton: true,
      confirmButtonText: "Close",
    });
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
      timer: 3000,
      showConfirmButton: false,
    });
  }
}

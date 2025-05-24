/*
  File: script.js
  Description: Handles interactivity for Job Application Tracker
  Features:
    - Adds new jobs
    - Displays them in a table
    - Allows search/filtering
    - Updates status
    - Deletes entries
    - Downloads data as CSV or JSON
*/

// Select form and UI elements
const form = document.getElementById("jobForm");
const tableBody = document.querySelector("#jobTable tbody");
const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");
const jobCount = document.getElementById("jobCount");

// Define possible job status options
const statuses = ["Newly Applied", "MIA", "Heard Back", "Rejected", "Sent Assessment"];

// Load saved jobs from local storage or start with empty array
let jobs = JSON.parse(localStorage.getItem("jobList")) || [];

// Save current jobs array to local storage
function saveToStorage() {
  localStorage.setItem("jobList", JSON.stringify(jobs));
}

// Set default dates on the form when page loads or form resets
function setDefaultDates() {
  document.getElementById("dateApplied").valueAsDate = new Date();
  document.getElementById("followUp").valueAsDate = new Date(Date.now() + 7 * 86400000);
}
setDefaultDates();

// Handle form submission to add a new job
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const job = {
    title: document.getElementById("title").value,
    company: document.getElementById("company").value,
    location: document.getElementById("location").value,
    skills: document.getElementById("skills").value,
    dateApplied: document.getElementById("dateApplied").value,
    notes: document.getElementById("notes").value,
    followUp: document.getElementById("followUp").value,
    status: document.getElementById("status").value,
  };

  jobs.push(job);
  saveToStorage();
  renderTable(jobs);
  form.reset();
  setDefaultDates();
});

// Render the job list in a table
function renderTable(data) {
  tableBody.innerHTML = "";
  jobCount.textContent = `Total Jobs Applied: ${data.length}`;

  data.forEach((job, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td contenteditable onblur="updateJob(${index}, 'title', this.textContent)">${job.title}</td>
      <td contenteditable onblur="updateJob(${index}, 'company', this.textContent)">${job.company}</td>
      <td contenteditable onblur="updateJob(${index}, 'location', this.textContent)">${job.location}</td>
      <td contenteditable onblur="updateJob(${index}, 'skills', this.textContent)">${job.skills}</td>
      <td contenteditable onblur="updateJob(${index}, 'dateApplied', this.textContent)">${job.dateApplied}</td>
      <td contenteditable onblur="updateJob(${index}, 'notes', this.textContent)">${job.notes}</td>
      <td contenteditable onblur="updateJob(${index}, 'followUp', this.textContent)">${job.followUp}</td>
      <td>
        <select onchange="updateStatus(${index}, this.value)">
          ${statuses.map(status => `<option value="${status}" ${status === job.status ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
      </td>
      <td><button onclick="deleteJob(${index})">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });
}

// Update a specific field in a job entry
function updateJob(index, field, value) {
  jobs[index][field] = value;
  saveToStorage();
}

// Update job status
function updateStatus(index, newStatus) {
  jobs[index].status = newStatus;
  saveToStorage();
  renderTable(jobs);
}

// Delete a job entry
function deleteJob(index) {
  jobs.splice(index, 1);
  saveToStorage();
  renderTable(jobs);
}

// Filter jobs by search text and status
function filterJobs() {
  const search = searchInput.value.toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = jobs.filter(job => {
    const matchesSearch = Object.values(job).some(val => val.toLowerCase().includes(search));
    const matchesStatus = selectedStatus === "" || job.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  renderTable(filtered);
}

// Event listeners for filtering
searchInput.addEventListener("input", filterJobs);
statusFilter.addEventListener("change", filterJobs);

// Download job list as CSV
function downloadCSV() {
  let csv = "Title,Company,Location,Skills,Date Applied,Notes,Follow Up,Status\n";
  jobs.forEach(j => {
    csv += `"${j.title}","${j.company}","${j.location}","${j.skills}","${j.dateApplied}","${j.notes}","${j.followUp}","${j.status}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "job_applications.csv";
  a.click();
}

// Download job list as JSON
function downloadJSON() {
  const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "job_applications.json";
  a.click();
}

// Initial render
renderTable(jobs);
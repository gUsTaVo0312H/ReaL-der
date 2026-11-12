import { demoUsers, initialAppointments, initialFinances, initialStudents, initialTeam } from "./data.js";
import { createId, downloadCsv, escapeHTML, formatDate, localToday, money, readStored, writeStored } from "./utils.js";

const page = document.body.dataset.page;
const sessionKey = "rl-session";
const session = readStored(sessionKey, null);

if (page === "login") {
  setupLogin();
} else if (!session) {
  window.location.replace("./index.html");
} else {
  setupPage(session);
}

function setupLogin() {
  const form = document.querySelector("#login-form");
  const cpfInput = document.querySelector("#login-cpf");
  const error = document.querySelector("#login-error");
  const loginStep = document.querySelector("#login-step");
  const mfaStep = document.querySelector("#mfa-step");
  const mfaForm = document.querySelector("#mfa-form");
  const mfaCode = document.querySelector("#mfa-code");
  const mfaError = document.querySelector("#mfa-error");
  const recoveryDialog = document.querySelector("#recovery-dialog");
  let pendingUser = null;

  cpfInput.addEventListener("input", () => {
    const digits = cpfInput.value.replace(/\D/g, "").slice(0, 11);
    cpfInput.value = digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const user = demoUsers.find((item) => item.cpf === cpfInput.value);
    const password = new FormData(form).get("password");

    if (!user || password !== "Demo@123") {
      error.textContent = "CPF ou senha incorretos. Confira os dados de demonstração.";
      error.hidden = false;
      return;
    }

    error.hidden = true;
    if (user.role === "student") {
      enter(user);
      return;
    }

    pendingUser = user;
    document.querySelector("#mfa-description").textContent =
      `Código demonstrativo para a conta de ${user.name}.`;
    loginStep.hidden = true;
    mfaStep.hidden = false;
    mfaCode.focus();
  });

  mfaCode.addEventListener("input", () => {
    mfaCode.value = mfaCode.value.replace(/\D/g, "").slice(0, 6);
  });

  mfaForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (mfaCode.value.length !== 6) {
      mfaError.textContent = "Digite o código demonstrativo de 6 dígitos.";
      mfaError.hidden = false;
      return;
    }
    if (pendingUser) enter(pendingUser);
  });

  document.querySelector("#mfa-back").addEventListener("click", () => {
    pendingUser = null;
    mfaCode.value = "";
    mfaError.hidden = true;
    mfaStep.hidden = true;
    loginStep.hidden = false;
  });

  document.querySelector("[data-open-recovery]").addEventListener("click", () => {
    recoveryDialog.showModal();
  });
  document.querySelectorAll("[data-close-recovery]").forEach((button) => {
    button.addEventListener("click", () => recoveryDialog.close());
  });

  function enter(user) {
    writeStored(sessionKey, user);
    window.location.assign(user.role === "student"
      ? "./portal-aluno.html"
      : user.role === "instructor"
        ? "./portal-instrutor.html"
        : "./dashboard.html");
  }
}

function setupPage(user) {
  if (user.role === "student" && page !== "student-portal") {
    window.location.replace("./portal-aluno.html");
    return;
  }
  if (user.role === "instructor" && page !== "instructor-portal") {
    window.location.replace("./portal-instrutor.html");
    return;
  }
  if (user.role !== "student" && page === "student-portal") {
    window.location.replace("./dashboard.html");
    return;
  }
  if (user.role !== "instructor" && page === "instructor-portal") {
    window.location.replace("./dashboard.html");
    return;
  }
  if (user.role === "reception" && ["finance", "reports", "team"].includes(page)) {
    window.location.replace("./dashboard.html");
    return;
  }

  let students = loadCollection("rl-students", initialStudents);
  let appointments = loadCollection("rl-appointments", initialAppointments);
  let finances = loadCollection("rl-finances", initialFinances);
  let users = loadCollection("rl-users", initialTeam);
  const dark = readStored("rl-theme-dark", false);
  if (dark) document.documentElement.classList.add("dark");

  document.querySelectorAll("[data-user-name]").forEach((element) => {
    element.textContent = user.name;
  });
  document.querySelectorAll("[data-user-role]").forEach((element) => {
    element.textContent = user.label;
  });
  document.querySelectorAll("[data-first-name]").forEach((element) => {
    element.textContent = user.name.split(" ")[0];
  });
  document.querySelectorAll("[data-user-initials]").forEach((element) => {
    element.textContent = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
  });
  document.querySelectorAll("[data-admin-only]").forEach((element) => {
    if (user.role !== "admin") element.remove();
  });
  document.querySelectorAll("[data-reception-only]").forEach((element) => {
    if (user.role === "reception") element.hidden = false;
    else element.remove();
  });

  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.removeItem(sessionKey);
      window.location.assign("./index.html");
    });
  });
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = !document.documentElement.classList.contains("dark");
      document.documentElement.classList.toggle("dark", next);
      writeStored("rl-theme-dark", next);
    });
  });
  document.querySelectorAll("[data-open-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.openDialog);
      if (!(dialog instanceof HTMLDialogElement)) return;
      const form = dialog.querySelector("form");
      form?.reset();
      if (form?.elements.id) form.elements.id.value = "";
      if (button.dataset.openDialog === "student-dialog") {
        setText("#student-dialog-title", "Adicionar aluno");
      } else if (button.dataset.openDialog === "appointment-dialog") {
        setText("#appointment-dialog-title", "Novo agendamento");
        if (form?.elements.date) form.elements.date.value = localToday();
      } else if (button.dataset.openDialog === "finance-dialog") {
        if (form?.elements.date) form.elements.date.value = localToday();
      }
      dialog.showModal();
    });
  });
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });

  document.querySelector("#student-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const id = values.id || createId("student");
    const record = { ...values, id };
    students = values.id
      ? students.map((student) => student.id === values.id ? { ...student, ...record } : student)
      : [...students, record];
    persist("rl-students", students);
    form.reset();
    form.elements.id.value = "";
    form.closest("dialog").close();
    renderStudents();
    renderDashboard();
    renderReports();
    updateStudentOptions();
  });

  document.querySelector("#appointment-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const record = { ...values, id: values.id || createId("appointment") };
    appointments = values.id
      ? appointments.map((item) => item.id === values.id ? { ...item, ...record } : item)
      : [...appointments, record];
    persist("rl-appointments", appointments);
    form.reset();
    form.elements.id.value = "";
    form.closest("dialog").close();
    renderSchedule();
    renderDashboard();
    renderReports();
    updateStudentOptions();
  });

  document.querySelector("#finance-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    finances = [...finances, {
      ...values,
      value: Number(values.value),
      id: createId("finance"),
      status: "Confirmado",
      student: "",
    }];
    persist("rl-finances", finances);
    form.reset();
    form.elements.date.value = localToday();
    form.closest("dialog").close();
    renderFinance();
    renderDashboard();
    renderReports();
  });

  const financeDate = document.querySelector("#finance-form")?.elements.date;
  if (financeDate) financeDate.value = localToday();

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    if (button.dataset.action === "edit-student") {
      const student = students.find((item) => item.id === button.dataset.id);
      if (student) openStudent(student);
    } else if (button.dataset.action === "delete-student") {
      if (window.confirm("Deseja remover este aluno?")) {
        students = students.filter((item) => item.id !== button.dataset.id);
        persist("rl-students", students);
        renderStudents();
        renderDashboard();
        renderReports();
        updateStudentOptions();
      }
    } else if (button.dataset.action === "edit-appointment") {
      const appointment = appointments.find((item) => item.id === button.dataset.id);
      if (appointment) openAppointment(appointment);
    } else if (button.dataset.action === "delete-appointment") {
      if (window.confirm("Deseja remover este agendamento?")) {
        appointments = appointments.filter((item) => item.id !== button.dataset.id);
        persist("rl-appointments", appointments);
        renderSchedule();
        renderDashboard();
        renderReports();
      }
    } else if (button.dataset.action === "delete-finance") {
      if (window.confirm("Deseja remover este lançamento?")) {
        finances = finances.filter((item) => item.id !== button.dataset.id);
        persist("rl-finances", finances);
        renderFinance();
        renderDashboard();
        renderReports();
      }
    }
  });

  document.querySelector("#student-search")?.addEventListener("input", renderStudents);
  document.querySelector("#schedule-filter")?.addEventListener("input", renderSchedule);
  document.querySelectorAll("[data-export]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.export === "finance") {
        downloadCsv("lancamentos-financeiros.csv", finances);
      } else {
        downloadCsv("resumo-operacional.csv", [{
          alunos: students.length,
          agendamentos: appointments.length,
          alunosEmAndamento: students.filter((student) => student.status === "Em andamento").length,
          receitas: totalByType(finances, "Receita"),
          despesas: totalByType(finances, "Despesa"),
          saldo: totalByType(finances, "Receita") - totalByType(finances, "Despesa"),
        }]);
      }
    });
  });

  const todayLabel = document.querySelector("[data-today]");
  if (todayLabel) {
    todayLabel.textContent = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(new Date());
  }

  renderStudents();
  renderSchedule();
  renderFinance();
  renderDashboard();
  renderReports();
  renderTeam();
  renderPortals();
  updateStudentOptions();

  function persist(key, value) {
    writeStored(key, value);
  }

  function renderStudents() {
    const table = document.querySelector("#students-table");
    if (!table) return;
    const query = document.querySelector("#student-search")?.value.trim().toLowerCase() || "";
    const filtered = students.filter((student) =>
      `${student.name} ${student.cpf}`.toLowerCase().includes(query));
    table.innerHTML = filtered.map((student) => `
      <tr>
        <td><strong>${escapeHTML(student.name)}</strong></td>
        <td>${escapeHTML(student.cpf)}</td>
        <td>${escapeHTML(student.category)}</td>
        <td>${statusBadge(student.status)}</td>
        <td><span class="table-action">
          <button type="button" data-action="edit-student" data-id="${escapeHTML(student.id)}">Editar</button>
          <button type="button" data-action="delete-student" data-id="${escapeHTML(student.id)}">Excluir</button>
        </span></td>
      </tr>`).join("");
    const empty = document.querySelector("#students-empty");
    if (empty) empty.hidden = filtered.length !== 0;
    const count = document.querySelector("#students-count");
    if (count) count.textContent = `${students.length} cadastro${students.length === 1 ? "" : "s"}`;
  }

  function renderSchedule() {
    const table = document.querySelector("#schedule-table");
    if (!table) return;
    const dateFilter = document.querySelector("#schedule-filter")?.value || "";
    const list = sortedAppointments().filter((item) => !dateFilter || item.date === dateFilter);
    table.innerHTML = list.map((item) => `
      <tr>
        <td><strong>${formatDate(escapeHTML(item.date))}</strong><br>${escapeHTML(item.time)}</td>
        <td>${escapeHTML(item.student)}</td>
        <td>${escapeHTML(item.instructor)}</td>
        <td>${escapeHTML(item.type)}</td>
        <td>${statusBadge(item.status)}</td>
        <td><span class="table-action">
          <button type="button" data-action="edit-appointment" data-id="${escapeHTML(item.id)}">Editar</button>
          <button type="button" data-action="delete-appointment" data-id="${escapeHTML(item.id)}">Excluir</button>
        </span></td>
      </tr>`).join("");
    const empty = document.querySelector("#schedule-empty");
    if (empty) empty.hidden = list.length !== 0;
    const count = document.querySelector("#schedule-count");
    if (count) count.textContent = String(appointments.length);
    const next = document.querySelector("#schedule-next");
    const nextAppointment = upcomingAppointments(appointments)[0];
    if (next) {
      next.textContent = nextAppointment
        ? `${formatDate(nextAppointment.date)} · ${nextAppointment.time}`
        : "—";
    }
  }

  function renderFinance() {
    const table = document.querySelector("#finance-table");
    if (!table) return;
    table.innerHTML = finances.map((record) => `
      <tr>
        <td><strong>${escapeHTML(record.description)}</strong></td>
        <td>${escapeHTML(record.category)}</td>
        <td>${formatDate(escapeHTML(record.date))}</td>
        <td>${statusBadge(record.type, record.type === "Receita" ? "positive" : "negative")}</td>
        <td>${money(Number(record.value))}</td>
        <td><span class="table-action"><button type="button" data-action="delete-finance" data-id="${escapeHTML(record.id)}">Excluir</button></span></td>
      </tr>`).join("");
    const empty = document.querySelector("#finance-empty");
    if (empty) empty.hidden = finances.length !== 0;
    setText("#finance-income", money(totalByType(finances, "Receita")));
    setText("#finance-expenses", money(totalByType(finances, "Despesa")));
    setText("#finance-balance", money(totalByType(finances, "Receita") - totalByType(finances, "Despesa")));
  }

  function renderDashboard() {
    setText("#stat-students", students.length);
    setText("#stat-appointments", appointments.length);
    setText("#stat-income", money(totalByType(finances, "Receita")));
    setText("#stat-balance", money(totalByType(finances, "Receita") - totalByType(finances, "Despesa")));
    const table = document.querySelector("#dashboard-agenda");
    if (!table) return;
    const upcoming = upcomingAppointments(appointments).slice(0, 5);
    table.innerHTML = upcoming.length
      ? `<table><thead><tr><th>Horário</th><th>Aluno</th><th>Instrutor</th><th>Situação</th></tr></thead><tbody>${upcoming.map((item) => `
          <tr><td><strong>${formatDate(escapeHTML(item.date))}</strong><br>${escapeHTML(item.time)}</td><td>${escapeHTML(item.student)}</td><td>${escapeHTML(item.instructor)}</td><td>${statusBadge(item.status)}</td></tr>`).join("")}</tbody></table>`
      : `<p class="empty-state">Nenhuma aula agendada.</p>`;
  }

  function renderReports() {
    setText("#report-students", students.length);
    setText("#report-appointments", appointments.length);
    setText("#report-active", students.filter((student) => student.status === "Em andamento").length);
    const income = totalByType(finances, "Receita");
    const expenses = totalByType(finances, "Despesa");
    setText("#report-income", money(income));
    setText("#report-expenses", money(expenses));
    setText("#report-balance", money(income - expenses));
    const container = document.querySelector("#report-categories");
    if (!container) return;
    const counts = students.reduce((result, student) => {
      result[student.category] = (result[student.category] || 0) + 1;
      return result;
    }, {});
    const max = Math.max(1, ...Object.values(counts));
    container.innerHTML = Object.entries(counts).map(([category, count]) => `
      <div class="report-row"><strong>Cat. ${escapeHTML(category)}</strong><span class="report-track"><span style="width:${Math.round(count / max * 100)}%"></span></span><strong>${count}</strong></div>`).join("")
      || `<p class="empty-state">Ainda não há alunos cadastrados.</p>`;
  }

  function renderTeam() {
    const table = document.querySelector("#team-table");
    if (!table) return;
    table.innerHTML = users.map((item) => `
      <tr><td><strong>${escapeHTML(item.name)}</strong></td><td>${escapeHTML(item.cpf)}</td><td>${escapeHTML(item.role || item.label || "Equipe")}</td><td>${statusBadge(item.status || "Ativa")}</td></tr>`).join("");
  }

  function renderPortals() {
    if (page === "student-portal") {
      const list = upcomingAppointments(appointments.filter((item) => item.student === user.name));
      const table = document.querySelector("#student-appointments");
      if (table) table.innerHTML = list.map((item) => `
        <tr><td><strong>${formatDate(escapeHTML(item.date))}</strong><br>${escapeHTML(item.time)}</td><td>${escapeHTML(item.instructor)}</td><td>${escapeHTML(item.type)}</td><td>${statusBadge(item.status)}</td></tr>`).join("")
        || `<tr><td colspan="4" class="empty-state">Nenhuma aula agendada no momento.</td></tr>`;
    }
    if (page === "instructor-portal") {
      const list = upcomingAppointments(appointments.filter((item) =>
        item.instructor.toLowerCase() === user.name.toLowerCase()));
      const table = document.querySelector("#instructor-appointments");
      if (table) table.innerHTML = list.map((item) => `
        <tr><td><strong>${formatDate(escapeHTML(item.date))}</strong><br>${escapeHTML(item.time)}</td><td>${escapeHTML(item.student)}</td><td>${escapeHTML(item.type)}</td><td>${statusBadge(item.status)}</td></tr>`).join("");
      setText("#instructor-count", list.length);
      const empty = document.querySelector("#instructor-empty");
      if (empty) empty.hidden = list.length !== 0;
    }
  }

  function openStudent(student) {
    const form = document.querySelector("#student-form");
    if (!form) return;
    form.elements.id.value = student.id;
    form.elements.name.value = student.name;
    form.elements.cpf.value = student.cpf;
    form.elements.category.value = student.category;
    form.elements.phone.value = student.phone || "";
    form.elements.status.value = student.status || "Em andamento";
    setText("#student-dialog-title", "Editar aluno");
    document.querySelector("#student-dialog").showModal();
  }

  function openAppointment(appointment) {
    const form = document.querySelector("#appointment-form");
    if (!form) return;
    form.elements.id.value = appointment.id;
    form.elements.student.value = appointment.student;
    form.elements.date.value = appointment.date;
    form.elements.time.value = appointment.time;
    form.elements.instructor.value = appointment.instructor;
    form.elements.type.value = appointment.type;
    form.elements.status.value = appointment.status;
    setText("#appointment-dialog-title", "Editar agendamento");
    document.querySelector("#appointment-dialog").showModal();
  }

  function updateStudentOptions() {
    const list = document.querySelector("#student-options");
    if (list) list.innerHTML = students.map((student) => `<option value="${escapeHTML(student.name)}"></option>`).join("");
  }

  function sortedAppointments() {
    return [...appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }
}

function loadCollection(key, defaults) {
  const stored = readStored(key, null);
  if (stored === null) {
    writeStored(key, defaults);
    return [...defaults];
  }
  if (!Array.isArray(stored)) {
    console.error(`Os dados locais "${key}" não estão no formato esperado.`);
    writeStored(key, defaults);
    return [...defaults];
  }
  return stored;
}

function totalByType(records, type) {
  return records.reduce((total, record) => record.type === type ? total + Number(record.value || 0) : total, 0);
}

function upcomingAppointments(records) {
  const now = new Date();
  const today = localToday();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return records
    .filter((appointment) =>
      appointment.status !== "Cancelada" &&
      appointment.status !== "Realizada" &&
      (appointment.date > today || (appointment.date === today && appointment.time >= currentTime)))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function statusBadge(value, tone) {
  let style = tone;
  if (!style) {
    if (["Concluído", "Confirmada", "Realizada", "Confirmado", "Ativa", "Disponível", "Pago"].includes(value)) style = "positive";
    else if (["Pendente", "Aguardando"].includes(value)) style = "pending";
    else if (["Cancelada", "Em atraso", "Inativa"].includes(value)) style = "negative";
  }
  return `<span class="status ${style ? `status-${style}` : ""}">${escapeHTML(value)}</span>`;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = String(value);
}

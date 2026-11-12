export const demoUsers = [
  { role: "admin", cpf: "000.000.000-00", name: "Amanda Ribeiro", label: "Administrador" },
  { role: "reception", cpf: "111.111.111-11", name: "Camila Souza", label: "Recepção" },
  { role: "instructor", cpf: "222.222.222-22", name: "Carlos Mendes", label: "Instrutor" },
  { role: "student", cpf: "333.333.333-33", name: "Mariana Oliveira", label: "Aluno" },
];

export const initialStudents = [
  { id: "student-0", name: "Mariana Oliveira", cpf: "123.456.789-10", category: "B", status: "Em andamento", phone: "(32) 99999-0000", email: "aluno1@exemplo.com", enrollment: "2025-02-12" },
  { id: "student-1", name: "Lucas Fernandes", cpf: "987.654.321-00", category: "A/B", status: "Em andamento", phone: "(32) 99999-0001", email: "aluno2@exemplo.com", enrollment: "2025-02-12" },
  { id: "student-2", name: "Ana Clara Souza", cpf: "234.567.890-11", category: "B", status: "Concluído", phone: "(32) 99999-0002", email: "aluno3@exemplo.com", enrollment: "2025-02-12" },
  { id: "student-3", name: "João Pedro Lima", cpf: "345.678.901-22", category: "A", status: "Pendente", phone: "(32) 99999-0003", email: "aluno4@exemplo.com", enrollment: "2025-02-12" },
  { id: "student-4", name: "Beatriz Martins", cpf: "456.789.012-33", category: "B", status: "Em andamento", phone: "(32) 99999-0004", email: "aluno5@exemplo.com", enrollment: "2025-02-12" },
  { id: "student-5", name: "Rafael Costa", cpf: "567.890.123-44", category: "A/B", status: "Em andamento", phone: "(32) 99999-0005", email: "aluno6@exemplo.com", enrollment: "2025-02-12" },
];

export const initialAppointments = [
  { id: "appointment-0", date: today(), time: "08:00", student: "Mariana Oliveira", instructor: "Carlos Mendes", type: "Aula prática · B", status: "Confirmada" },
  { id: "appointment-1", date: today(), time: "09:30", student: "Lucas Fernandes", instructor: "Patrícia Alves", type: "Aula prática · A", status: "Confirmada" },
  { id: "appointment-2", date: today(), time: "11:00", student: "Beatriz Martins", instructor: "Carlos Mendes", type: "Aula prática · B", status: "Aguardando" },
  { id: "appointment-3", date: today(), time: "14:00", student: "Rafael Costa", instructor: "Rogério Silva", type: "Simulador", status: "Confirmada" },
  { id: "appointment-4", date: today(), time: "16:30", student: "João Pedro Lima", instructor: "Patrícia Alves", type: "Aula prática · A", status: "Cancelada" },
];

export const initialFinances = [
  { id: "finance-1", type: "Receita", description: "Mensalidade · Parcela 3/6", category: "Mensalidade", value: 480, date: today(), payment: "Pix", student: "Mariana Oliveira", status: "Confirmado" },
  { id: "finance-2", type: "Receita", description: "Taxa de matrícula", category: "Matrícula", value: 320, date: today(), payment: "Cartão", student: "Beatriz Martins", status: "Confirmado" },
  { id: "finance-3", type: "Despesa", description: "Manutenção de veículo", category: "Manutenção", value: 250, date: today(), payment: "Pix", student: "", status: "Confirmado" },
];

export const initialTeam = demoUsers.map((user, index) => ({
  id: `user-${index}`,
  name: user.name,
  cpf: user.cpf,
  role: user.label,
  status: "Ativa",
}));

function today() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

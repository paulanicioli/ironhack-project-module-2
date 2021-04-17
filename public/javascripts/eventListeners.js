// document.getElementById('editStudent').addEventListener('click', () => {
//   console.log('Event Listener ativado!');
//   document.getElementById('editStudent').className = 'modal';
// });

// Edits displayed fields in User Creation form depending on their role

// document.getElementById('newUserRole').addEventListener('input', (event) => {
//   console.log('New event triggered!');
//   const role = document.getElementById('newUserRole').value;
//   const form = document.getElementById('newUserForm');
//   const userGradeInput = document.getElementById('newStudentGradeInput');
//   const parentChildrenInput = document.getElementById('newParentChildren');
//   if (role !== 'student' && userGradeInput) {
//     userGradeInput.parentNode.removeChild(userGradeInput);
//   } else if (role === 'student' && !userGradeInput) {
//     form.innerHTML += `<div class="mb-3" id="newStudentGradeInput">
//     <label for="newUserGrade" class="form-label">Série que o aluno cursa atualmente:</label>
//     <select class="form-select" id="newUserGrade">
//         <option selected value="1EM">1º ano do Ensino Médio</option>
//         <option value="2EM">2º ano do Ensino Médio</option>
//         <option value="3EM">3º ano do Ensino Médio</option>
//     </select>
//   </div>`;
//   }
//   if (role !== 'parent' && parentChildrenInput) {
//     parentChildrenInput.parentNode.removeChild(parentChildrenInput);
//   } else if (role === 'parent' && !parentChildrenInput) {

//     form.innerHTML += `<div class="mb-3" id="newParentChildren">
//     <label for="newChild" class="form-label">Filhos:</label>
//     <select class="form-select" id="newChild">
//         <option selected value="1EM">Aluno 1</option>
//         <option value="2EM">Aluno 2</option>
//         <option value="3EM">Aluno 3</option>
//     </select>
//   </div>`;
//   }
// });

// rota de cadastro fica numa rota protegida (a do professor)

// rota que entrega view e rota que entre res.json (API), dá para usar o Axios para trazer alguma informação (API)

const services = [
  ['Диагностика ходовой', 'Осмотр подвески и рулевого управления', 1200],
  ['Компьютерная диагностика', 'Чтение ошибок и проверка параметров', 1500],
  ['Замена масла и фильтра', 'Работа по замене масла в двигателе', 1000],
  ['Замена тормозных колодок', 'Работа на одной оси', 1800],
  ['Замена тормозных дисков', 'Работа на одной оси', 2400],
  ['Замена охлаждающей жидкости', 'Слив и заправка системы охлаждения', 1600],
];
const rubles = new Intl.NumberFormat('ru-RU');
const price = (amount) => rubles.format(amount) + ' ₽';
document.querySelector('#price-list').innerHTML = services.map(([name, details, amount]) =>
  '<div class="price"><b>' + name + '</b><span>' + details + '</span><strong>от ' + price(amount) + '</strong></div>'
).join('');
const options = document.querySelector('#options');
options.innerHTML = services.map(([name, , amount], index) =>
  '<label class="option"><input type="checkbox" value="' + index + '"><span>' + name + '</span><span>' + price(amount) + '</span></label>'
).join('');
const selected = () => [...options.querySelectorAll('input:checked')].map((input) => services[Number(input.value)]);
const sum = (items) => items.reduce((total, [, , amount]) => total + amount, 0);
options.addEventListener('change', () => {
  document.querySelector('#total').value = price(sum(selected()));
});
const form = document.querySelector('#request');
let currentEstimate = '';
document.querySelector('#use-estimate').addEventListener('click', () => {
  const items = selected();
  let details = form.elements.details.value;
  if (currentEstimate && details.includes(currentEstimate)) {
    details = details.replace(currentEstimate, '').trim();
  }
  currentEstimate = items.length ? 'Работы: ' + items.map(([name]) => name).join(', ') + '. Стоимость работ от ' + price(sum(items)) + '.' : '';
  form.elements.details.value = [details, currentEstimate].filter(Boolean).join('\n');
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const digits = form.elements.phone.value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    form.elements.phone.setCustomValidity('Введите номер телефона с кодом города или страны.');
    form.elements.phone.reportValidity();
    return;
  }
  const data = new FormData(form);
  const draft = ['Черновик заявки в автосервис «По смете»', 'Имя: ' + data.get('name'), 'Телефон: ' + data.get('phone'), 'Автомобиль: ' + data.get('car'), 'Комментарий: ' + data.get('details')].join('\n');
  downloadText('zayavka-po-smete.txt', draft);
  document.querySelector('#status').textContent = 'Черновик скачивается. Данные остались у вас.';
});
form.elements.phone.addEventListener('input', () => form.elements.phone.setCustomValidity(''));

function downloadText(filename, contents) {
  const url = URL.createObjectURL(new Blob([contents], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const feedbackForm = document.querySelector('#feedback-form');
const messageField = feedbackForm.elements.message;
const feedbackStatus = document.querySelector('#feedback-status');
feedbackForm.addEventListener('input', () => {
  messageField.setCustomValidity('');
  feedbackStatus.textContent = '';
});
feedbackForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = messageField.value.trim();
  if (!message) {
    messageField.setCustomValidity('Напишите сообщение.');
    messageField.reportValidity();
    return;
  }
  const {name, email} = feedbackForm.elements;
  const lines = ['Обратная связь для автосервиса «По смете»'];
  if (name.value.trim()) lines.push('Имя: ' + name.value.trim());
  if (email.value.trim()) lines.push('Email: ' + email.value.trim());
  lines.push('', message);
  downloadText('obratnaya-svyaz-po-smete.txt', lines.join('\n'));
  feedbackStatus.textContent = 'Сообщение подготовлено для скачивания.';
});

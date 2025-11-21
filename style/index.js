import './base.css';

// Via: https://discourse.jupyter.org/t/changing-favicon-with-notebook-extension/2721

const head = document.head || document.getElementsByTagName('head')[0];

const link = document.createElement('link');
const oldLink = document.getElementsByClassName('favicon');
link.rel = 'icon';
link.type = 'image/x-icon';
link.href =
  'https://www.kbase.us/wp-content/uploads/sites/6/2020/08/kbase-favicon-32-bgwhite_rounded_corners.png';
if (oldLink && oldLink[0]) {
  link.classList = oldLink[0].classList;
  head.removeChild(oldLink[0]);
}
head.appendChild(link);

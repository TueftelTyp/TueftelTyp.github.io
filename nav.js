// Automatische Erkennung der aktuellen Seite und Active-Link setzen
document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav a');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    
    // Vergleiche Dateiname ohne .html
    const linkPath = link.getAttribute('href').replace('.html', '');
    const currentPage = currentPath.replace('.html', '');
    
    if (linkPath === currentPage) {
      link.classList.add('active');
    }
  });
});

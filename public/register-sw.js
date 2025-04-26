if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js', {
            scope: '/gemini/'
        })
        .then(reg => {
            reg.update();
        })
        .catch(error => {
            console.error('SW failed to register:', error);
        });
}
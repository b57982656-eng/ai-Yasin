// minimal-load.js - کد بهینه‌سازی سرعت بارگذاری سایت

(function() {
    'use strict';
    
    // تنظیمات بهینه‌سازی
    const config = {
        lazyLoad: true,
        preloadCritical: true,
        optimizeImages: true,
        deferNonCritical: true
    };
    
    // بارگذاری تنبل تصاویر
    if (config.lazyLoad) {
        const lazyImages = [].slice.call(document.querySelectorAll('img[data-src]'));
        
        if ('IntersectionObserver' in window) {
            const lazyImageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target;
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.classList.remove('lazy');
                        lazyImageObserver.unobserve(lazyImage);
                    }
                });
            });
            
            lazyImages.forEach(function(lazyImage) {
                lazyImageObserver.observe(lazyImage);
            });
        } else {
            // Fallback برای مرورگرهای قدیمی
            lazyImages.forEach(function(lazyImage) {
                lazyImage.src = lazyImage.dataset.src;
            });
        }
    }
    
    // پیش‌بارگذاری منابع حیاتی
    if (config.preloadCritical) {
        const criticalResources = [
            // فونت‌ها، استایل‌ها و اسکریپت‌های حیاتی
        ];
        
        criticalResources.forEach(function(resource) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.url;
            link.as = resource.type;
            if (resource.crossorigin) link.crossOrigin = '';
            document.head.appendChild(link);
        });
    }
    
    // بهینه‌سازی تصاویر
    if (config.optimizeImages) {
        // تبدیل فرمت تصاویر به WebP در صورت پشتیبانی مرورگر
        function checkWebPSupport(callback) {
            const webP = new Image();
            webP.onload = webP.onerror = function() {
                callback(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        }
        
        checkWebPSupport(function(support) {
            if (support) {
                const images = document.querySelectorAll('img[data-webp]');
                images.forEach(function(img) {
                    img.src = img.dataset.webp;
                });
            }
        });
    }
    
    // به تعویق انداختن منابع غیرحیاتی
    if (config.deferNonCritical) {
        window.addEventListener('load', function() {
            // بارگذاری اسکریپت‌های غیرحیاتی پس از لود کامل صفحه
            const nonCriticalScripts = [
                // اسکریپت‌های غیرحیاتی
            ];
            
            nonCriticalScripts.forEach(function(scriptSrc) {
                const script = document.createElement('script');
                script.src = scriptSrc;
                script.async = true;
                document.body.appendChild(script);
            });
            
            // بارگذاری تصاویر پس‌زمینه غیرحیاتی
            const lazyBackgrounds = [].slice.call(document.querySelectorAll('[data-bg]'));
            lazyBackgrounds.forEach(function(background) {
                background.style.backgroundImage = `url(${background.dataset.bg})`;
            });
        });
    }
    
    // مدیریت کش مرورگر
    function cacheFirst(request) {
        return caches.match(request).then(function(response) {
            return response || fetch(request).then(function(fetchResponse) {
                caches.open('static-cache').then(function(cache) {
                    cache.put(request, fetchResponse.clone());
                });
                return fetchResponse;
            });
        });
    }
    
    // ثبت Service Worker برای کش کردن
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('ServiceWorker ثبت شد: ', registration.scope);
            }).catch(function(error) {
                console.log('خطا در ثبت ServiceWorker: ', error);
            });
        });
    }
    
    // اندازه‌گیری عملکرد
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domReadyTime = perfData.domComplete - perfData.domLoading;
                
                console.log(`زمان بارگذاری صفحه: ${pageLoadTime}ms`);
                console.log(`زمان آماده شدن DOM: ${domReadyTime}ms`);
                
                // ارسال داده‌های عملکرد به سرور (اختیاری)
                // sendPerformanceData({ pageLoadTime, domReadyTime });
            }, 0);
        });
    }
    
    // بهینه‌سازی انیمیشن‌ها
    function optimizeAnimations() {
        const elements = document.querySelectorAll('*');
        elements.forEach(function(element) {
            element.style.willChange = 'auto';
        });
        
        // تنظیم will-change فقط برای المان‌های در حال انیمیشن
        document.addEventListener('mouseover', function(e) {
            e.target.style.willChange = 'transform, opacity';
        });
        
        document.addEventListener('mouseout', function(e) {
            e.target.style.willChange = 'auto';
        });
    }
    
    // اجرای بهینه‌سازی‌ها پس از لود DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', optimizeAnimations);
    } else {
        optimizeAnimations();
    }
    
    // مدیریت حافظه
    function cleanupMemory() {
        if (window.gc) {
            window.gc();
        }
        
        // حذف listenerهای غیرضروری
        window.removeEventListener('beforeunload', cleanupMemory);
    }
    
    window.addEventListener('beforeunload', cleanupMemory);
    
})();

// تابع کمکی برای بارگذاری پویای منابع
function loadResource(url, type) {
    return new Promise(function(resolve, reject) {
        let resource;
        
        if (type === 'script') {
            resource = document.createElement('script');
            resource.src = url;
            resource.async = true;
        } else if (type === 'style') {
            resource = document.createElement('link');
            resource.rel = 'stylesheet';
            resource.href = url;
        } else if (type === 'image') {
            resource = new Image();
            resource.src = url;
        }
        
        resource.onload = function() {
            resolve(resource);
        };
        
        resource.onerror = function() {
            reject(new Error(`Failed to load ${url}`));
        };
        
        if (type === 'style') {
            document.head.appendChild(resource);
        } else if (type === 'script') {
            document.body.appendChild(resource);
        }
    });
}

// مدیریت خطاهای بارگذاری تصاویر
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        console.warn('خطا در بارگذاری تصویر: ', e.target.src);
        // جایگزینی با تصویر پیش‌فرض در صورت نیاز
        // e.target.src = '/path/to/fallback-image.jpg';
    }
}, true);
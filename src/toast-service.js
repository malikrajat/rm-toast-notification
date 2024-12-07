import DOMPurify from 'dompurify';

class ToastNotification {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.position = 'fixed';
        this.container.style.zIndex = '9999';
        this.container.style.width = '500px';
        this.toasts = [];
        document.body.appendChild(this.container);
    }

    showToast(options = {}) {
        const {
            type = 'info',
            position = 'top-right',
            duration = 3000,
            header = '',
            footer = '',
            body = '',
            logo = '',
            color = '',
            onClick = null,
            actionButton = null,
            animation = true,
        } = options;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.position = 'relative';
        toast.style.padding = '1em';
        toast.style.margin = '0.5em';
        toast.style.backgroundColor = color || this.getColor(type);
        toast.style.borderRadius = '5px';
        toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        toast.style.animation = animation ? this.getAnimation(position) : 'none';
        toast.style.display = 'flex';
        toast.style.flexDirection = 'row';
        toast.style.alignItems = 'center';
        toast.style.justifyContent = 'flex-start';
        toast.style.transition = 'transform 0.3s ease, background-color 0.3s ease';

        // Event handlers
        const handleMouseOver = () => {
            toast.style.transform = 'scale(1.05)';
            toast.style.opacity = '0.90';
            toast.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
        };

        const handleMouseOut = () => {
            toast.style.transform = 'scale(1)';
            toast.style.opacity = '1';
            toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        };

        // Attach event listeners
        toast.addEventListener('mouseover', handleMouseOver);
        toast.addEventListener('mouseout', handleMouseOut);

        // Close button at top-right
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.border = 'none';
        closeButton.style.background = 'transparent';
        closeButton.style.fontSize = '20px';
        closeButton.style.color = '#000';
        closeButton.style.cursor = 'pointer';
        closeButton.style.zIndex = '1001';
        closeButton.style.transition = 'color 0.3s ease';

        // Close button hover handlers
        const handleButtonMouseOver = () => {
            closeButton.style.color = '#fff'
        };

        const handleButtonMouseOut = () => {
            closeButton.style.color = '#000'
        };

        // Attach button hover event listeners
        closeButton.addEventListener('mouseover', handleButtonMouseOver);
        closeButton.addEventListener('mouseout', handleButtonMouseOut);

        closeButton.addEventListener('click', () => {
            cleanupToast();
            this.closeToast(toast);
        });


        // Create two columns for logo and content
        const leftColumn = document.createElement('div');
        leftColumn.style.flex = '0 0 auto';
        leftColumn.style.marginRight = '15px';

        // Add logo to the left column
        if (logo) {
            const logoImg = document.createElement('img');
            logoImg.src = logo;
            logoImg.alt = 'logo';
            logoImg.style.width = '30px';
            logoImg.style.height = '30px';
            logoImg.style.objectFit = 'contain';
            leftColumn.appendChild(logoImg);
        }

        // Create the right column for the content (header, body, action, footer)
        const rightColumn = document.createElement('div');
        rightColumn.style.flex = '1 1 auto';
        rightColumn.style.display = 'flex';
        rightColumn.style.flexDirection = 'column';
        rightColumn.style.justifyContent = 'center';

        // Add header at the top-left
        if (header) {
            const headerElem = document.createElement('strong');
            headerElem.textContent = header;
            rightColumn.appendChild(headerElem);
        }

        // Add body content (text or HTML), ensuring its left-aligned
        const bodyElem = document.createElement('div');
        if (body) {
            if (this.isItHtml(body)) {
                bodyElem.innerHTML = DOMPurify.sanitize(body);
            } else {
                bodyElem.textContent = body; // Use textContent to prevent XSS
            }
        }
        rightColumn.appendChild(bodyElem);

        // Add action button if provided
        if (actionButton) {
            const button = document.createElement('button');
            button.textContent = actionButton.text;
            button.style.width = 'fit-content';
            button.style.maxWidth = '150px';
            button.style.padding = '0.5em 1em';
            button.style.marginTop = '10px';
            button.style.backgroundColor = this.getActionButtonColor(type);
            button.style.color = '#FFF';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
            button.style.display = 'block';
            button.style.transition = 'background-color 0.3s ease';
            button.style.zIndex = '1000';

            const handleActionBtnMouseOver = () => {
                button.style.color = '#000';
            };

            const handleActionBtnMouseOut = () => {
                button.style.color = '#fff';
            };

            button.addEventListener('mouseover', handleActionBtnMouseOver);
            button.addEventListener('mouseout', handleActionBtnMouseOut);

            button.addEventListener('click', actionButton.onClick);
            rightColumn.appendChild(button);
        }

        // Add footer at the bottom-left
        if (footer) {
            const footerElem = document.createElement('div');
            footerElem.textContent = footer;
            rightColumn.appendChild(footerElem);
        }

        // Append left and right columns to the toast
        toast.appendChild(leftColumn);
        toast.appendChild(rightColumn);


        let timeout;
        const startTimer = () => {
            if (duration !== null) {
                timeout = setTimeout(() => {
                    cleanupToast();
                    this.closeToast(toast);
                }, duration);
            }
        };

        const stopTimer = () => clearTimeout(timeout);

        toast.addEventListener('mouseover', stopTimer);
        toast.addEventListener('mouseout', startTimer);

        toast.addEventListener('click', (event) => {
            if (onClick) onClick(event);
            this.closeToast(toast);
        });

        toast.appendChild(closeButton); // Add the close button to the toast
        this.container.style[position.includes('top') ? 'top' : 'bottom'] = '0px';
        this.container.style[position.includes('right') ? 'right' : 'left'] = '0px';
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Cleanup function to remove event listeners
        const cleanupToast = () => {
            toast.removeEventListener('mouseover', stopTimer);
            toast.removeEventListener('mouseout', startTimer);
            toast.removeEventListener('click', stopTimer);
            toast.removeEventListener('click', () => {
                if (onClick) onClick();
                this.closeToast(toast);
            });
        };

        startTimer(); // Start the timer when the toast is shown
    }

    isItHtml(str) {
        const doc = new DOMParser().parseFromString(str, 'text/html');
        return Array.from(doc.body.childNodes).some(node => node.nodeType === 1); // Check for any element node
    }

    closeToast(toast) {
        toast.style.transform = 'scale(0.9)';
        toast.style.opacity = '0';
        setTimeout(() => {
            // Only remove the toast if it's still in the container
            if (this.container.contains(toast)) {
                this.container.removeChild(toast);
                const index = this.toasts.indexOf(toast);
                if (index !== -1) {
                    this.toasts.splice(index, 1);
                }
            }
        }, 300);
    }

    getColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#0096FF',
        };
        return colors[type];
    }

    getAnimation(position) {
        const animations = {
            'top-left': 'slideInFromLeft 0.5s ease-out',
            'top-right': 'slideInFromRight 0.5s ease-out',
            'bottom-left': 'slideInFromLeft 0.5s ease-out',
            'bottom-right': 'slideInFromRight 0.5s ease-out',
        };
        return animations[position] || 'slideInFromRight 0.5s ease-out';
    }

    getActionButtonColor(type) {
        const colors = {
            success: '#218838',
            error: '#c82333',
            warning: '#e0a800',
            info: '#007bff',
        };
        return colors[type];
    }
}

// CSS for animations
const style = document.createElement('style');
style.textContent = `

/* Define slide-in from left */
@keyframes slideInFromLeft {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Define slide-in from right */
@keyframes slideInFromRight {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Define slide-out to left */
@keyframes slideOutToLeft {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

/* Define slide-out to right */
@keyframes slideOutToRight {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

`;
document.head.appendChild(style);

export default ToastNotification
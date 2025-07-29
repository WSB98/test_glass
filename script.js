let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

const container = document.getElementById('draggableContainer');
const mainContainer = document.querySelector('.main-container');

function dragStart(e) {
    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }

    if (e.target === container || container.contains(e.target)) {
        isDragging = true;
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Get main container dimensions instead of window
        const mainContainerRect = mainContainer.getBoundingClientRect();
        const mainContainerWidth = mainContainerRect.width;
        const mainContainerHeight = mainContainerRect.height;

        // Calculate boundaries relative to main container (accounting for the -50% transform)
        const minX = -mainContainerWidth / 2 + containerWidth / 2;
        const maxX = mainContainerWidth / 2 - containerWidth / 2;
        const minY = -mainContainerHeight / 2 + containerHeight / 2;
        const maxY = mainContainerHeight / 2 - containerHeight / 2;

        // Constrain to main container bounds
        const constrainedX = Math.max(minX, Math.min(maxX, currentX));
        const constrainedY = Math.max(minY, Math.min(maxY, currentY));

        container.style.transform = `translate(calc(-50% + ${constrainedX}px), calc(-50% + ${constrainedY}px))`;
    }
}

// Mouse events
container.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

// Touch events for mobile
container.addEventListener('touchstart', dragStart);
document.addEventListener('touchmove', drag);
document.addEventListener('touchend', dragEnd);

// Initialize all inputs from CSS variables
function initializeInputsFromCSS() {
    const rootStyles = getComputedStyle(document.documentElement);
    
    // Get initial values from CSS variables
    const initialTextContent = rootStyles.getPropertyValue('--initial-text-content').replace(/"/g, '').trim();
    const initialFontSize = parseInt(rootStyles.getPropertyValue('--initial-font-size'));
    const initialFontColor = rootStyles.getPropertyValue('--initial-font-color').trim();
    const initialBackgroundUrl = rootStyles.getPropertyValue('--initial-background-url').replace(/"/g, '').trim();
    const initialTintColor = rootStyles.getPropertyValue('--initial-tint-color').trim();
    const initialShadowColor = rootStyles.getPropertyValue('--initial-shadow-color').trim();
    
    // Set input values
    document.getElementById('textContent').value = initialTextContent;
    document.getElementById('fontSize').value = initialFontSize;
    document.getElementById('fontSizeValue').textContent = initialFontSize + 'px';
    document.getElementById('fontColor').value = initialFontColor;
    document.getElementById('backgroundUrl').value = initialBackgroundUrl;
    document.getElementById('tintColor').value = initialTintColor;
    document.getElementById('shadowColor').value = initialShadowColor;
    
    // Set initial text content and background
    document.querySelector('.glass-text').textContent = initialTextContent;
    mainContainer.style.background = `url('${initialBackgroundUrl}') center/cover no-repeat`;
}

// Control functionality
function updateCSSVariable(property, value, unit = '') {
    document.documentElement.style.setProperty(property, value + unit);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '255, 255, 255';
}

// Slider event listeners
document.getElementById('shadowBlur').addEventListener('input', function() {
    updateCSSVariable('--shadow-blur', this.value, 'px');
    document.getElementById('shadowBlurValue').textContent = this.value + 'px';
});

document.getElementById('shadowSpread').addEventListener('input', function() {
    updateCSSVariable('--shadow-spread', this.value, 'px');
    document.getElementById('shadowSpreadValue').textContent = this.value + 'px';
});

document.getElementById('tintOpacity').addEventListener('input', function() {
    updateCSSVariable('--tint-opacity', this.value);
    document.getElementById('tintOpacityValue').textContent = this.value;
});

document.getElementById('frostBlur').addEventListener('input', function() {
    updateCSSVariable('--frost-blur', this.value, 'px');
    document.getElementById('frostBlurValue').textContent = this.value + 'px';
});

document.getElementById('noiseFreq').addEventListener('input', function() {
    updateCSSVariable('--noise-frequency', this.value);
    document.getElementById('noiseFreqValue').textContent = this.value;
    // Update SVG filter
    document.querySelector('#glass-distortion feTurbulence').setAttribute('baseFrequency', this.value);
    // Force Safari to refresh the filter rendering
    forceSafariFilterRefresh();
});

document.getElementById('distortion').addEventListener('input', function() {
    updateCSSVariable('--distortion-strength', this.value);
    document.getElementById('distortionValue').textContent = this.value;
    // Update SVG filter
    document.querySelector('#glass-distortion feDisplacementMap').setAttribute('scale', this.value);
    // Force Safari to refresh the filter rendering
    forceSafariFilterRefresh();
});

document.getElementById('outerShadow').addEventListener('input', function() {
    updateCSSVariable('--outer-shadow-blur', this.value, 'px');
    document.getElementById('outerShadowValue').textContent = this.value + 'px';
});

document.getElementById('tintColor').addEventListener('input', function() {
    const rgb = hexToRgb(this.value);
    updateCSSVariable('--tint-color', rgb);
});

document.getElementById('shadowColor').addEventListener('input', function() {
    const rgb = hexToRgb(this.value);
    const opacity = 0.7; // Keep consistent opacity
    updateCSSVariable('--shadow-color', `rgba(${rgb}, ${opacity})`);
});

// Background URL control
document.getElementById('backgroundUrl').addEventListener('input', function() {
    if (this.value.trim()) {
        mainContainer.style.background = `url('${this.value}') center/cover no-repeat`;
    }
});

// Text content control
document.getElementById('textContent').addEventListener('input', function() {
    document.querySelector('.glass-text').textContent = this.value || 'Your Text Here';
});

// Font size control
document.getElementById('fontSize').addEventListener('input', function() {
    document.querySelector('.glass-text').style.fontSize = this.value + 'px';
    document.getElementById('fontSizeValue').textContent = this.value + 'px';
});

// Font color control
document.getElementById('fontColor').addEventListener('input', function() {
    document.querySelector('.glass-text').style.color = this.value;
});

// Initialize all inputs from CSS variables
initializeInputsFromCSS();

// Safari compatibility - preserves visual effect while fixing rendering issues
function initSafariCompatibility() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
        // Force Safari to properly render SVG filters by triggering reflows
        const svgFilter = document.querySelector('#glass-distortion');
        if (svgFilter) {
            // Initial fix - force Safari to acknowledge the filter
            setTimeout(() => {
                const container = document.querySelector('.container');
                if (container) {
                    // Temporarily force a style recalculation
                    const originalFilter = container.style.filter;
                    container.style.filter = 'none';
                    container.offsetHeight; // Force reflow
                    container.style.filter = originalFilter;
                }
            }, 50);
            
            // Additional Safari-specific reflow trigger
            setTimeout(() => {
                svgFilter.style.display = 'none';
                svgFilter.offsetHeight; // Trigger reflow
                svgFilter.style.display = '';
            }, 100);
        }
    }
}

// Initialize Safari compatibility
initSafariCompatibility();

// Helper function to force Safari filter re-rendering (preserves visual effect)
function forceSafariFilterRefresh() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
        const svgFilter = document.querySelector('#glass-distortion');
        if (svgFilter) {
            // Force Safari to re-render the filter without changing appearance
            requestAnimationFrame(() => {
                svgFilter.style.display = 'none';
                svgFilter.offsetHeight; // Trigger reflow
                svgFilter.style.display = '';
            });
        }
    }
}

// Export CSS function
function exportCSS() {
    const zip = new JSZip();
    const rootStyles = getComputedStyle(document.documentElement);
    
    // Get current values
    const fontSize = document.getElementById('fontSize').value;
    const fontColor = document.getElementById('fontColor').value;
    const textContent = document.getElementById('textContent').value;
    const backgroundUrl = document.getElementById('backgroundUrl').value;
    const noiseFreq = document.getElementById('noiseFreq').value;
    const distortion = document.getElementById('distortion').value;
    
    // Create complete CSS file
    const cssContent = `/* Liquid Glass Effect CSS
 * Generated from Liquid Glass Generator
 * Include this CSS file in your project and add the displacement map HTML to your page
 */

:root {
    /* Glass Effect Variables - Customize these values */
    --shadow-offset: ${rootStyles.getPropertyValue('--shadow-offset').trim()};
    --shadow-blur: ${rootStyles.getPropertyValue('--shadow-blur').trim()};
    --shadow-spread: ${rootStyles.getPropertyValue('--shadow-spread').trim()};
    --shadow-color: ${rootStyles.getPropertyValue('--shadow-color').trim()};
    --tint-color: ${rootStyles.getPropertyValue('--tint-color').trim()};
    --tint-opacity: ${rootStyles.getPropertyValue('--tint-opacity').trim()};
    --frost-blur: ${rootStyles.getPropertyValue('--frost-blur').trim()};
    --noise-frequency: ${rootStyles.getPropertyValue('--noise-frequency').trim()};
    --distortion-strength: ${rootStyles.getPropertyValue('--distortion-strength').trim()};
    --outer-shadow-blur: ${rootStyles.getPropertyValue('--outer-shadow-blur').trim()};
}

/* Glass Effect - Apply this class to your glass elements */
.glass-effect {
    position: relative;
    width: fit-content;
    min-width: 300px;
    height: fit-content;
    border-radius: 28px;
    isolation: isolate;
    box-shadow: 0px 6px var(--outer-shadow-blur) rgba(0, 0, 0, 0.2);
    padding: 2rem;
}

.glass-effect::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: 28px;
    box-shadow:
        inset var(--shadow-offset) var(--shadow-offset) var(--shadow-blur) var(--shadow-spread) var(--shadow-color);
    background-color: rgba(var(--tint-color), var(--tint-opacity));
}

.glass-effect::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: 28px;
    backdrop-filter: blur(var(--frost-blur));
    -webkit-backdrop-filter: blur(var(--frost-blur));
    filter: url(#glass-distortion);
    -webkit-filter: url("#glass-distortion");
    isolation: isolate;
}

/* Content inside glass effect */
.glass-effect > * {
    position: relative;
    z-index: 1;
}

/* Optional: Draggable glass effect */
.glass-effect.draggable {
    cursor: move;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
}

.glass-effect.draggable:active {
    transform: scale(0.98);
}

/* Example styling for text inside glass */
.glass-text {
    margin: 0 auto;
    text-align: center;
    font-size: ${fontSize}px;
    font-weight: bold;
    color: ${fontColor};
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    font-family: 'Arial', sans-serif;
    width: fit-content;
    pointer-events: none;
}`;

    // Create displacement map HTML (keeping original for best visual effect)
    const displacementMapHTML = `<!-- Glass Effect Displacement Map -->
<!-- Include this SVG element somewhere in your HTML page (preferably near the top of the body) -->
<svg style="position: absolute; width: 0; height: 0;" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="glass-distortion">
            <feTurbulence baseFrequency="${noiseFreq}" numOctaves="2" result="turbulence"/>
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="${distortion}"/>
        </filter>
    </defs>
</svg>`;

    // Create README
    const readmeContent = `# Liquid Glass Effect

A modern, customizable glass morphism effect for web elements.

 ## Installation
 
 1. Add the \`liquid-glass-effect.css\` file to your project
 2. Link it in your HTML: \`<link rel="stylesheet" href="liquid-glass-effect.css">\`
 3. Include the displacement map from \`glass-displacement-map.html\` in your page
 4. **For Safari compatibility**: Include \`safari-compatibility.js\` (optional, preserves visual effect)

## Basic Usage

 ### HTML Structure
 \`\`\`html
 <!DOCTYPE html>
 <html>
 <head>
     <link rel="stylesheet" href="liquid-glass-effect.css">
 </head>
 <body>
     <!-- Include the displacement map (copy from glass-displacement-map.html) -->
     <svg style="position: absolute; width: 0; height: 0;" xmlns="http://www.w3.org/2000/svg">
         <defs>
             <filter id="glass-distortion">
                 <feTurbulence baseFrequency="${noiseFreq}" numOctaves="2" result="turbulence"/>
                 <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="${distortion}"/>
             </filter>
         </defs>
     </svg>
 
     <!-- Your glass element -->
     <div class="glass-effect">
         <h2 class="glass-text">${textContent || 'Your Text Here'}</h2>
     </div>
     
     <!-- Optional: Safari compatibility (recommended for Safari users) -->
     <script src="safari-compatibility.js"></script>
 </body>
 </html>
 \`\`\`

## Customization

### CSS Variables
You can customize the glass effect by modifying these CSS variables in your \`:root\` selector:

- \`--shadow-blur\`: Inner shadow blur radius
- \`--shadow-spread\`: Inner shadow spread
- \`--shadow-color\`: Inner shadow color
- \`--tint-color\`: Glass tint color (RGB values)
- \`--tint-opacity\`: Glass tint opacity (0-1)
- \`--frost-blur\`: Background blur intensity
- \`--noise-frequency\`: Distortion noise frequency
- \`--distortion-strength\`: Distortion intensity
- \`--outer-shadow-blur\`: Drop shadow blur radius

### Example Customization
\`\`\`css
:root {
    --shadow-blur: 30px;
    --tint-color: 138, 43, 226; /* Purple tint */
    --tint-opacity: 0.3;
    --frost-blur: 4px;
}
\`\`\`

## Advanced Usage

### Making it Draggable
Add the \`draggable\` class to enable drag functionality:
\`\`\`html
<div class="glass-effect draggable">
    <h2 class="glass-text">Draggable Glass</h2>
</div>
\`\`\`

Note: Dragging functionality requires additional JavaScript (not included in this package).

### Multiple Glass Elements
You can have multiple glass elements on the same page. Each will use the same displacement map:
\`\`\`html
<div class="glass-effect">
    <p>First glass element</p>
</div>

<div class="glass-effect">
    <p>Second glass element</p>
</div>
\`\`\`

 ## Browser Support
 
 - Modern browsers with CSS backdrop-filter support
 - Safari requires \`-webkit-backdrop-filter\`
 - Fallback styling provided for older browsers
 
 ### Safari Compatibility
 
 Safari can have issues rendering SVG filters properly. The included \`safari-compatibility.js\` fixes this by:
 
 - **Automatically detecting Safari** and applying browser-specific rendering fixes
 - **Forcing SVG filter re-rendering** to ensure distortion effects display correctly
 - **Preserving the exact visual appearance** - no changes to the beautiful glass effect
 - **Zero impact on other browsers** - only runs Safari-specific code when needed
 
 The script is completely optional but **highly recommended** for Safari users. It's a small JavaScript file that ensures the liquid glass effect renders perfectly on Safari without altering the visual appearance.

## Notes

- The displacement map SVG must be included on every page where you use the glass effect
- The SVG can be placed anywhere in your HTML (it's hidden with \`width: 0; height: 0\`)
- For best results, use the glass effect over background images or gradients
- The effect works best with light or semi-transparent backgrounds

Generated with current settings:
- Font Size: ${fontSize}px
- Font Color: ${fontColor}
- Text Content: "${textContent || 'Your Text Here'}"
- Background: ${backgroundUrl || 'Default'}
- Noise Frequency: ${noiseFreq}
- Distortion: ${distortion}
`;

    // Create Safari compatibility JavaScript (non-intrusive, preserves visual effect)
    const safariCompatJS = `// Safari Compatibility for Liquid Glass Effect
// This script fixes Safari rendering issues without altering the visual appearance
// Include this script AFTER your HTML content for Safari users

(function() {
    'use strict';
    
    // Safari compatibility - preserves visual effect while fixing rendering issues
    function initSafariCompatibility() {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        if (isSafari) {
            // Force Safari to properly render SVG filters by triggering reflows
            const svgFilter = document.querySelector('#glass-distortion');
            if (svgFilter) {
                // Initial fix - force Safari to acknowledge the filter
                setTimeout(() => {
                    const containers = document.querySelectorAll('.glass-effect');
                    containers.forEach(container => {
                        // Temporarily force a style recalculation
                        const originalFilter = container.style.filter;
                        container.style.filter = 'none';
                        container.offsetHeight; // Force reflow
                        container.style.filter = originalFilter;
                    });
                }, 50);
                
                // Additional Safari-specific reflow trigger
                setTimeout(() => {
                    svgFilter.style.display = 'none';
                    svgFilter.offsetHeight; // Trigger reflow
                    svgFilter.style.display = '';
                }, 100);
            }
        }
    }
    
    // Helper function to force Safari filter re-rendering (preserves visual effect)
    function forceSafariFilterRefresh() {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
            const svgFilter = document.querySelector('#glass-distortion');
            if (svgFilter) {
                // Force Safari to re-render the filter without changing appearance
                requestAnimationFrame(() => {
                    svgFilter.style.display = 'none';
                    svgFilter.offsetHeight; // Trigger reflow
                    svgFilter.style.display = '';
                });
            }
        }
    }
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSafariCompatibility);
    } else {
        initSafariCompatibility();
    }
    
    // Export the refresh function for manual use if needed
    window.forceSafariGlassRefresh = forceSafariFilterRefresh;
    
})();`;

    // Add files to ZIP
    zip.file("liquid-glass-effect.css", cssContent);
    zip.file("glass-displacement-map.html", displacementMapHTML);
    zip.file("safari-compatibility.js", safariCompatJS);
    zip.file("README.md", readmeContent);

    // Generate and download ZIP
    zip.generateAsync({type:"blob"}).then(function(content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'liquid-glass-effect-package.zip';
        a.click();
        URL.revokeObjectURL(url);

        // Visual feedback
        const btn = document.querySelector('.export-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Downloaded!';
        btn.style.background = '#28a745';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 2000);
    });
}
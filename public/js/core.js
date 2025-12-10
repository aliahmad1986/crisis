
        // Initialize Dashboard
        document.addEventListener('DOMContentLoaded', function () {
            console.log('Dashboard Professional v2.0 Initialized');

            // DOM Elements
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('main-content');
            const sidebarToggle = document.getElementById('sidebarToggle');
            const toggleIcon = document.getElementById('toggleIcon');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const mobileOverlay = document.createElement('div');
            mobileOverlay.className = 'mobile-overlay';
            document.body.appendChild(mobileOverlay);

            // Settings Panel Elements
            const dashboardSettingsBtnDesktop = document.getElementById('dashboardSettingsBtnDesktop');
            const dashboardSettingsBtnMobile = document.getElementById('dashboardSettingsBtnMobile');
            const settingsPanel = document.getElementById('settingsPanel');
            const settingsOverlay = document.getElementById('settingsOverlay');
            const settingsClose = document.getElementById('settingsClose');
            const applySettingsBtn = document.getElementById('applySettings');
            const resetSettingsBtn = document.getElementById('resetSettings');

            // State
            let sidebarExpanded = true;
            let mobileMenuOpen = false;

            // Store submenu states
            let openSubmenus = new Set();

            // Desktop Sidebar Toggle - RTL Adjusted
            function toggleDesktopSidebar() {
                sidebarExpanded = !sidebarExpanded;

                if (sidebarExpanded) {
                    sidebar.classList.remove('collapsed');
                    toggleIcon.classList.remove('bi-chevron-left');
                    toggleIcon.classList.add('bi-chevron-right'); // RTL: Changed icon

                    // Restore submenu states after sidebar expands
                    setTimeout(() => {
                        document.querySelectorAll('.menu-item.has-submenu').forEach(item => {
                            if (openSubmenus.has(item)) {
                                item.classList.add('open');
                            }
                        });
                    }, 300); // Wait for sidebar transition to complete
                } else {
                    // Save which submenus are open before collapsing
                    openSubmenus.clear();
                    document.querySelectorAll('.menu-item.has-submenu.open').forEach(item => {
                        openSubmenus.add(item);
                    });

                    sidebar.classList.add('collapsed');
                    toggleIcon.classList.remove('bi-chevron-right'); // RTL: Changed icon
                    toggleIcon.classList.add('bi-chevron-left');
                }

                localStorage.setItem('sidebarExpanded', sidebarExpanded);
                showToast('Menu ' + (sidebarExpanded ? 'expanded' : 'collapsed'));
            }

            // Mobile Menu Toggle
            function toggleMobileMenu() {
                mobileMenuOpen = !mobileMenuOpen;

                if (mobileMenuOpen) {
                    sidebar.classList.add('mobile-open');
                    mobileOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';

                    mobileOverlay.addEventListener('click', function () {
                        toggleMobileMenu();
                    });
                } else {
                    sidebar.classList.remove('mobile-open');
                    mobileOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }

            // Settings Panel Functions
            function openSettingsPanel() {
                settingsPanel.classList.add('open');
                settingsOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            function closeSettingsPanel() {
                settingsPanel.classList.remove('open');
                settingsOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }

            // Apply Settings
            function applySettings() {
                const theme = document.querySelector('.theme-option.active').dataset.theme;
                const sidebarFixed = document.getElementById('sidebarFixed').checked;
                const headerFixed = document.getElementById('headerFixed').checked;

                // Apply theme
                document.body.setAttribute('data-theme', theme);

                // Save settings
                const settings = {
                    theme: theme,
                    sidebarFixed: sidebarFixed,
                    headerFixed: headerFixed,
                    timestamp: new Date().toISOString()
                };

                localStorage.setItem('dashboardSettings', JSON.stringify(settings));

                closeSettingsPanel();
                showToast('Settings applied successfully');
            }

            // Reset Settings
            function resetSettings() {
                document.querySelectorAll('.theme-option').forEach(option => {
                    option.classList.remove('active');
                });
                document.querySelector('[data-theme="light"]').classList.add('active');

                document.getElementById('sidebarFixed').checked = true;
                document.getElementById('headerFixed').checked = true;

                localStorage.removeItem('dashboardSettings');
                document.body.removeAttribute('data-theme');

                showToast('Settings reset to default');
            }

            // Show Toast Notification
            function showToast(message) {
                const toast = document.createElement('div');
                toast.className = 'toast-notification';
                toast.textContent = message;
                document.body.appendChild(toast);

                setTimeout(() => {
                    toast.remove();
                }, 3000);
            }

            // Load Settings
            function loadSettings() {
                const savedSettings = localStorage.getItem('dashboardSettings');
                if (savedSettings) {
                    try {
                        const settings = JSON.parse(savedSettings);

                        // Load theme
                        if (settings.theme) {
                            document.querySelectorAll('.theme-option').forEach(option => {
                                option.classList.remove('active');
                                if (option.dataset.theme === settings.theme) {
                                    option.classList.add('active');
                                }
                            });
                            document.body.setAttribute('data-theme', settings.theme);
                        }

                        // Load other settings
                        if (settings.sidebarFixed !== undefined) {
                            document.getElementById('sidebarFixed').checked = settings.sidebarFixed;
                        }
                        if (settings.headerFixed !== undefined) {
                            document.getElementById('headerFixed').checked = settings.headerFixed;
                        }
                    } catch (e) {
                        console.error('Error loading settings:', e);
                    }
                }

                // Load sidebar state
                const savedSidebarState = localStorage.getItem('sidebarExpanded');
                if (savedSidebarState !== null) {
                    sidebarExpanded = savedSidebarState === 'true';
                    if (!sidebarExpanded) {
                        sidebar.classList.add('collapsed');
                        toggleIcon.classList.remove('bi-chevron-right'); // RTL: Changed icon
                        toggleIcon.classList.add('bi-chevron-left');
                    } else {
                        // When sidebar is expanded on load, ensure submenus are visible if they should be
                        setTimeout(() => {
                            document.querySelectorAll('.menu-item.has-submenu.open').forEach(item => {
                                const submenu = item.querySelector('.submenu');
                                if (submenu) {
                                    submenu.style.maxHeight = '500px';
                                    submenu.style.opacity = '1';
                                    submenu.style.visibility = 'visible';
                                }
                            });
                        }, 100);
                    }
                }
            }

            // Handle mobile/desktop settings button visibility
            function handleResponsiveLayout() {
                if (window.innerWidth <= 992) {
                    // Mobile view
                    dashboardSettingsBtnMobile.classList.remove('d-none');
                    dashboardSettingsBtnDesktop.style.display = 'none';
                } else {
                    // Desktop view
                    dashboardSettingsBtnMobile.classList.add('d-none');
                    dashboardSettingsBtnDesktop.style.display = 'flex';
                }
            }

            // Submenu Functionality
            function initSubmenus() {
                // Handle main menu items with submenus
                document.querySelectorAll('.menu-item.has-submenu > a').forEach(link => {
                    link.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        const parent = this.closest('.menu-item');

                        // Only toggle if sidebar is not collapsed
                        if (sidebar.classList.contains('collapsed')) {
                            // If sidebar is collapsed, expand it first
                            if (!sidebarExpanded) {
                                toggleDesktopSidebar();
                                // Wait for sidebar to expand before opening submenu
                                setTimeout(() => {
                                    parent.classList.add('open');
                                }, 300);
                            }
                            return;
                        }

                        // Close other submenus at the same level
                        if (!parent.classList.contains('open')) {
                            document.querySelectorAll('.menu-item.has-submenu.open').forEach(item => {
                                if (item !== parent) {
                                    item.classList.remove('open');
                                }
                            });
                        }

                        // Toggle current submenu
                        parent.classList.toggle('open');

                        // Ensure proper animation
                        const submenu = parent.querySelector('.submenu');
                        if (parent.classList.contains('open')) {
                            submenu.style.maxHeight = '500px';
                            submenu.style.opacity = '1';
                            submenu.style.visibility = 'visible';
                            openSubmenus.add(parent);
                        } else {
                            submenu.style.maxHeight = '0';
                            submenu.style.opacity = '0';
                            submenu.style.visibility = 'hidden';
                            openSubmenus.delete(parent);
                        }
                    });
                });

                // Handle nested submenu items
                document.querySelectorAll('.submenu-item.has-submenu').forEach(item => {
                    item.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        // Only toggle if sidebar is not collapsed
                        if (sidebar.classList.contains('collapsed')) return;

                        // Toggle nested submenu
                        this.classList.toggle('open');

                        // Ensure proper animation
                        const nestedSubmenu = this.querySelector('.nested-submenu');
                        if (this.classList.contains('open')) {
                            nestedSubmenu.style.maxHeight = '300px';
                            nestedSubmenu.style.opacity = '1';
                            nestedSubmenu.style.visibility = 'visible';
                        } else {
                            nestedSubmenu.style.maxHeight = '0';
                            nestedSubmenu.style.opacity = '0';
                            nestedSubmenu.style.visibility = 'hidden';
                        }

                        // Close other nested submenus at the same level
                        const parentSubmenu = this.closest('.submenu');
                        parentSubmenu.querySelectorAll('.submenu-item.has-submenu.open').forEach(subItem => {
                            if (subItem !== this) {
                                subItem.classList.remove('open');
                                const otherNested = subItem.querySelector('.nested-submenu');
                                if (otherNested) {
                                    otherNested.style.maxHeight = '0';
                                    otherNested.style.opacity = '0';
                                    otherNested.style.visibility = 'hidden';
                                }
                            }
                        });
                    });
                });

                // Handle submenu item clicks
                document.querySelectorAll('.submenu-item:not(.has-submenu), .nested-submenu-item').forEach(item => {
                    item.addEventListener('click', function (e) {
                        e.preventDefault();

                        // Only process if sidebar is not collapsed
                        if (sidebar.classList.contains('collapsed')) return;

                        // Remove active class from all submenu items
                        document.querySelectorAll('.submenu-item.active, .nested-submenu-item.active').forEach(activeItem => {
                            activeItem.classList.remove('active');
                        });

                        // Add active class to clicked item
                        this.classList.add('active');

                        // Close mobile menu if open
                        if (window.innerWidth <= 992 && mobileMenuOpen) {
                            toggleMobileMenu();
                        }

                        showToast('Navigating to ' + (this.querySelector('span')?.textContent || this.textContent));
                    });
                });

                // Close submenus when clicking outside
                document.addEventListener('click', function (e) {
                    if (!e.target.closest('.menu-item.has-submenu') && !e.target.closest('.submenu')) {
                        document.querySelectorAll('.menu-item.has-submenu.open').forEach(item => {
                            item.classList.remove('open');
                            const submenu = item.querySelector('.submenu');
                            if (submenu) {
                                submenu.style.maxHeight = '0';
                                submenu.style.opacity = '0';
                                submenu.style.visibility = 'hidden';
                            }
                            openSubmenus.delete(item);
                        });

                        document.querySelectorAll('.submenu-item.has-submenu.open').forEach(item => {
                            item.classList.remove('open');
                            const nestedSubmenu = item.querySelector('.nested-submenu');
                            if (nestedSubmenu) {
                                nestedSubmenu.style.maxHeight = '0';
                                nestedSubmenu.style.opacity = '0';
                                nestedSubmenu.style.visibility = 'hidden';
                            }
                        });
                    }
                });
            }

            // Event Listeners
            sidebarToggle.addEventListener('click', toggleDesktopSidebar);
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
            dashboardSettingsBtnDesktop.addEventListener('click', openSettingsPanel);
            dashboardSettingsBtnMobile.addEventListener('click', openSettingsPanel);
            settingsClose.addEventListener('click', closeSettingsPanel);
            settingsOverlay.addEventListener('click', closeSettingsPanel);
            applySettingsBtn.addEventListener('click', applySettings);
            resetSettingsBtn.addEventListener('click', resetSettings);

            // Theme selection
            document.querySelectorAll('.theme-option').forEach(option => {
                option.addEventListener('click', function () {
                    document.querySelectorAll('.theme-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    this.classList.add('active');
                });
            });

            // Menu item click handlers
            document.querySelectorAll('.menu-item:not(.has-submenu) a').forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();

                    // Update active state
                    document.querySelectorAll('.menu-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    this.closest('.menu-item').classList.add('active');

                    // Close mobile menu if open
                    if (window.innerWidth <= 992 && mobileMenuOpen) {
                        toggleMobileMenu();
                    }

                    showToast('Navigating to ' + (this.querySelector('.menu-text')?.textContent || 'Dashboard'));
                });
            });

            // Handle Escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    if (mobileMenuOpen) toggleMobileMenu();
                    if (settingsPanel.classList.contains('open')) closeSettingsPanel();

                    // Close all open submenus
                    document.querySelectorAll('.menu-item.has-submenu.open, .submenu-item.has-submenu.open').forEach(item => {
                        item.classList.remove('open');
                        const submenu = item.querySelector('.submenu');
                        const nestedSubmenu = item.querySelector('.nested-submenu');
                        if (submenu) {
                            submenu.style.maxHeight = '0';
                            submenu.style.opacity = '0';
                            submenu.style.visibility = 'hidden';
                        }
                        if (nestedSubmenu) {
                            nestedSubmenu.style.maxHeight = '0';
                            nestedSubmenu.style.opacity = '0';
                            nestedSubmenu.style.visibility = 'hidden';
                        }
                    });
                    openSubmenus.clear();
                }
            });

            // Handle window resize
            window.addEventListener('resize', function () {
                handleResponsiveLayout();

                if (window.innerWidth > 992 && mobileMenuOpen) {
                    toggleMobileMenu();
                }
            });

            // Initialize
            loadSettings();
            handleResponsiveLayout();
            initSubmenus();
        });


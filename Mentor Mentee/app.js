let users = JSON.parse(localStorage.getItem('mentorUsers')) || [
            {
                id: 1,
                name: 'Alice Johnson',
                email: 'alice@example.com',
                password: '123456',
                role: 'mentor',
                skills: ['JavaScript', 'React', 'Node.js'],
                availability: 'Weekends',
                requests: []
            },
            {
                id: 2,
                name: 'Bob Smith',
                email: 'bob@example.com',
                password: '123456',
                role: 'mentor',
                skills: ['Python', 'Machine Learning', 'Data Science'],
                availability: 'Evenings',
                requests: []
            },
            {
                id: 3,
                name: 'Charlie Brown',
                email: 'charlie@example.com',
                password: '123456',
                role: 'mentor',
                skills: ['UX Design', 'Adobe Creative Suite', 'User Research'],
                availability: 'Mornings',
                requests: []
            }
        ];
        
        let currentUser = null;
        let currentView = 'home';

        // Initialize app
        document.addEventListener('DOMContentLoaded', () => {
            checkLoggedIn();
            setupEventListeners();
            if (currentUser) updateMainContent();
        });

        function checkLoggedIn() {
            const storedUser = JSON.parse(localStorage.getItem('currentUser'));
            if (storedUser) {
                currentUser = storedUser;
                document.getElementById('heroSection').classList.add('hidden');
                document.getElementById('mainContent').classList.remove('hidden');
                document.getElementById('currentUser').textContent = `Hello, ${currentUser.name}`;
                updateMainContent();
            }
        }

        function setupEventListeners() {
            document.getElementById('getStartedBtn').addEventListener('click', () => {
                document.getElementById('loginModal').style.display = 'flex';
            });
            
            document.getElementById('regRole').addEventListener('change', () => {
                const mentorFields = document.getElementById('mentorFields');
                if (document.getElementById('regRole').value === 'mentor') {
                    mentorFields.style.display = 'block';
                } else {
                    mentorFields.style.display = 'none';
                }
            });

            document.getElementById('authForm').addEventListener('submit', handleAuth);

            // Navigation
            document.getElementById('homeTab').addEventListener('click', () => switchView('home'));
            document.getElementById('mentorsTab').addEventListener('click', () => switchView('mentors'));
            document.getElementById('requestsTab').addEventListener('click', () => switchView('requests'));
            document.getElementById('profileTab').addEventListener('click', () => switchView('profile'));
        }

        function handleAuth(e) {
            e.preventDefault();
            const authMessage = document.getElementById('authMessage');
            authMessage.textContent = '';

            if (document.querySelector('.tab.active').textContent === 'Login') {
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                const user = users.find(u => u.email === email && u.password === password);
                if (user) {
                    currentUser = user;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    document.getElementById('loginModal').style.display = 'none';
                    document.getElementById('heroSection').classList.add('hidden');
                    document.getElementById('mainContent').classList.remove('hidden');
                    document.getElementById('currentUser').textContent = `Hello, ${user.name}`;
                    updateMainContent();
                } else {
                    authMessage.textContent = 'Invalid email or password';
                }
            } else {
                const name = document.getElementById('regName').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                const role = document.getElementById('regRole').value;
                const skills = document.getElementById('regSkills').value.split(',').map(s => s.trim()).filter(s => s);
                const availability = document.getElementById('regAvailability').value;

                if (users.find(u => u.email === email)) {
                    authMessage.textContent = 'Email already registered';
                    return;
                }

                const newUser = {
                    id: users.length + 1,
                    name,
                    email,
                    password,
                    role,
                    skills: role === 'mentor' ? skills : [],
                    availability: role === 'mentor' ? availability : '',
                    requests: []
                };

                users.push(newUser);
                localStorage.setItem('mentorUsers', JSON.stringify(users));
                currentUser = newUser;
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                document.getElementById('loginModal').style.display = 'none';
                updateMainContent();
            }
        }

        function updateMainContent() {
            document.querySelectorAll('.content-view').forEach(view => view.classList.add('hidden'));
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

            if (currentView === 'home') {
                document.getElementById('homeView').classList.remove('hidden');
                document.getElementById('homeTab').classList.add('active');
            } else if (currentView === 'mentors') {
                document.getElementById('mentorsView').classList.remove('hidden');
                document.getElementById('mentorsTab').classList.add('active');
                populateMentors();
            } else if (currentView === 'requests') {
                document.getElementById('requestsView').classList.remove('hidden');
                document.getElementById('requestsTab').classList.add('active');
                populateRequests();
            } else if (currentView === 'profile') {
                document.getElementById('profileView').classList.remove('hidden');
                document.getElementById('profileTab').classList.add('active');
                populateProfile();
            }
        }

        function switchView(view) {
            currentView = view;
            updateMainContent();
        }

        function populateMentors() {
            const mentorsList = document.getElementById('mentorsList');
            mentorsList.innerHTML = '';

            const mentors = users.filter(u => u.role === 'mentor' && u.id !== currentUser.id);
            mentors.forEach(mentor => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <img src="https://placehold.co/300x200" alt="Professional portrait of ${mentor.name} in a corporate environment symbolizing expertise and mentorship" class="w-full h-48 object-cover rounded-lg mb-4" onerror="this.src='https://placehold.co/300x200/e2e8f0/6366f1?text=Mentor'">
                    <h4 class="text-xl font-bold mb-2">${mentor.name}</h4>
                    <p class="text-gray-600 mb-1"><strong>Skills:</strong> ${mentor.skills.join(', ')}</p>
                    <p class="text-gray-600 mb-4"><strong>Availability:</strong> ${mentor.availability}</p>
                    ${currentUser.role === 'mentee' ? `<button onclick="requestMentorship(${mentor.id})" class="btn btn-primary">Request Mentorship</button>` : ''}
                `;
                mentorsList.appendChild(card);
            });
        }

        function populateRequests() {
            const requestsList = document.getElementById('requestsList');
            requestsList.innerHTML = '';

            if (currentUser.role !== 'mentor') {
                requestsList.innerHTML = '<p class="text-white">Only mentors can view requests.</p>';
                return;
            }

            const currentUserData = users.find(u => u.id === currentUser.id);
            if (currentUserData.requests.length === 0) {
                requestsList.innerHTML = '<p class="text-white">No pending requests.</p>';
            } else {
                currentUserData.requests.forEach(requestId => {
                    const requester = users.find(u => u.id === requestId);
                    if (requester) {
                        const requestItem = document.createElement('div');
                        requestItem.className = 'bg-white p-4 rounded-lg';
                        requestItem.innerHTML = `
                            <h5 class="font-bold">${requester.name}</h5>
                            <p>${requester.email}</p>
                        `;
                        requestsList.appendChild(requestItem);
                    }
                });
            }
        }

        function populateProfile() {
            const profileInfo = document.getElementById('profileInfo');
            profileInfo.innerHTML = `
                <p><strong>Name:</strong> ${currentUser.name}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Role:</strong> ${currentUser.role}</p>
                ${currentUser.role === 'mentor' ? `
                <p><strong>Skills:</strong> ${currentUser.skills.join(', ')}</p>
                <p><strong>Availability:</strong> ${currentUser.availability}</p>` : ''}
            `;

            if (currentUser.role === 'mentor') {
                document.getElementById('mentorEditFields').style.display = 'block';
                document.getElementById('editSkills').value = currentUser.skills.join(', ');
                document.getElementById('editAvailability').value = currentUser.availability;
            }
        }

        function toggleEditProfile() {
            const editFields = document.getElementById('mentorEditFields');
            editFields.classList.toggle('hidden');
        }

        function updateProfile() {
            const skills = document.getElementById('editSkills').value.split(',').map(s => s.trim()).filter(s => s);
            const availability = document.getElementById('editAvailability').value;

            currentUser.skills = skills;
            currentUser.availability = availability;

            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('mentorUsers', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                populateProfile();
                alert('Profile updated successfully!');
            }
        }

        function requestMentorship(mentorId) {
            const mentor = users.find(u => u.id === mentorId);
            if (mentor && !mentor.requests.includes(currentUser.id)) {
                mentor.requests.push(currentUser.id);
                localStorage.setItem('mentorUsers', JSON.stringify(users));
                alert('Mentorship request sent!');
                populateMentors();
            } else {
                alert('Request already sent or mentor not found.');
            }
        }

        function logout() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            document.getElementById('mainContent').classList.add('hidden');
            document.getElementById('heroSection').classList.remove('hidden');
        }

        function closeLoginModal() {
            document.getElementById('loginModal').style.display = 'none';
        }

        function switchTab(tab) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab')[tab === 'login' ? 0 : 1].classList.add('active');
            document.getElementById('loginFields').style.display = tab === 'login' ? 'block' : 'none';
            document.getElementById('registerFields').style.display = tab === 'register' ? 'block' : 'none';
            document.getElementById('authMessage').textContent = '';
        }

        // Click outside modal to close
        window.onclick = function(event) {
            const modal = document.getElementById('loginModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
(() => {
	const hero = document.getElementById('hero');
	const story = document.getElementById('story');
	const revealLayer = document.getElementById('revealLayer');
	const revealGlow = document.getElementById('revealGlow');
	const revealVideo = document.getElementById('revealVideo');
	const title = document.querySelector('.hero-title');
	const notes = Array.from(document.querySelectorAll('.hero-note'));
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const isCoarse = window.matchMedia('(pointer: coarse)').matches;

	const pointer = {
		targetX: window.innerWidth * 0.5,
		targetY: window.innerHeight * 0.52,
		x: window.innerWidth * 0.5,
		y: window.innerHeight * 0.52,
		targetRadius: 260,
		radius: 260,
	};

	const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

	const setCSSVars = () => {
		hero.style.setProperty('--spot-x', `${pointer.x}px`);
		hero.style.setProperty('--spot-y', `${pointer.y}px`);
		hero.style.setProperty('--spot-r', `${pointer.radius}px`);
		if (revealGlow) {
			revealGlow.style.left = `${pointer.x}px`;
			revealGlow.style.top = `${pointer.y}px`;
		}
	};

	const syncByScroll = () => {
		const total = Math.max(1, story.offsetHeight - window.innerHeight);
		const progress = clamp(window.scrollY / total, 0, 1);
		const titleShift = progress * -18;
		const titleOpacity = 1 - progress * 0.14;

		if (title) {
			title.style.transform = `translateY(${titleShift}px)`;
			title.style.opacity = `${titleOpacity}`;
		}

		notes.forEach((note, index) => {
			const depth = Number(note.dataset.depth || index + 1);
			const offset = progress * depth * -16;
			const opacity = 1 - progress * (index === 0 ? 0.18 : 0.12);
			note.style.transform = `translateY(${offset}px)`;
			note.style.opacity = `${opacity}`;
		});

		if (isCoarse) {
			pointer.targetRadius = 190 + progress * 90;
		}
	};

	const animate = () => {
		if (!prefersReducedMotion && !isCoarse) {
			pointer.x += (pointer.targetX - pointer.x) * 0.14;
			pointer.y += (pointer.targetY - pointer.y) * 0.14;
		}
		pointer.radius += (pointer.targetRadius - pointer.radius) * 0.12;
		setCSSVars();
		requestAnimationFrame(animate);
	};

	const activateReveal = () => {
		hero.classList.add('is-ready');
		if (revealVideo && revealVideo.paused) {
			const playPromise = revealVideo.play();
			if (playPromise && typeof playPromise.catch === 'function') {
				playPromise.catch(() => {});
			}
		}
	};

	const warmVideo = () => {
		if (!revealVideo) return;
		revealVideo.muted = true;
		revealVideo.playsInline = true;
		const playPromise = revealVideo.play();
		if (playPromise && typeof playPromise.then === 'function') {
			playPromise.then(() => {
				revealVideo.pause();
				revealVideo.currentTime = 0;
				activateReveal();
				if (!isCoarse) {
					const replay = revealVideo.play();
					if (replay && typeof replay.catch === 'function') replay.catch(() => {});
				}
			}).catch(() => {
				activateReveal();
			});
		} else {
			activateReveal();
		}
	};

	window.addEventListener('pointermove', (event) => {
		if (isCoarse || prefersReducedMotion) return;
		pointer.targetX = event.clientX;
		pointer.targetY = event.clientY;
	});

	window.addEventListener('resize', () => {
		pointer.targetX = window.innerWidth * 0.5;
		pointer.targetY = window.innerHeight * 0.52;
		if (isCoarse) pointer.targetRadius = 220;
		syncByScroll();
	});

	window.addEventListener('scroll', syncByScroll, { passive: true });

	if (revealLayer) {
		revealLayer.addEventListener('pointerenter', activateReveal);
	}

	if (revealVideo) {
		revealVideo.addEventListener('loadeddata', activateReveal, { once: true });
		revealVideo.addEventListener('canplay', activateReveal, { once: true });
		revealVideo.addEventListener('error', () => {
			hero.classList.add('is-ready');
		});
	}

	if (!prefersReducedMotion) {
		requestAnimationFrame(() => {
			document.body.classList.add('is-loaded');
		});
	} else {
		document.body.classList.add('is-loaded');
	}

	if (isCoarse) {
		pointer.targetRadius = 220;
		pointer.radius = 220;
	}

	setCSSVars();
	syncByScroll();
	warmVideo();
	requestAnimationFrame(animate);
})();

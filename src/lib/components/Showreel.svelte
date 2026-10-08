<script lang="ts">
	import { asset } from '$app/paths';
</script>

<figure class="showreel" id="showreel" aria-labelledby="showreel-title">
	<figcaption class="showreel-copy">
		<p class="technical eyebrow">Motion study / 00:15</p>
		<h2 id="showreel-title">Idle,<br />interrupted.</h2>
		<p id="film-summary">
			Fifteen seconds of type, motion and original sound. Three independent experiments, each with
			its own rhythm.
		</p>
		<a class="film-download" href={asset('/film/idle-interrupted.mp4')} download>
			Download MP4 <span class="technical">1080p / 60 fps ↓</span>
		</a>
		<details class="film-description">
			<summary>Read film description</summary>
			<ol>
				<li>
					<strong>0–2s.</strong> A quiet clock gives way to “interrupted.” A pulse breaks the silence.
				</li>
				<li>
					<strong>2–6s.</strong> Kanade’s island changes shape around its top-center anchor. A clock becomes
					an activity, then a media surface. Elastic motion and rounded tones.
				</li>
				<li>
					<strong>6–10s.</strong> Kinetix routes a request. Fictional Target A is unavailable; eligible
					Target B is selected before response commitment. Angular paths and metallic clicks.
				</li>
				<li>
					<strong>10–13s.</strong> Merro’s plan is approved before implementation and verification. Independent
					review accepts the change. Separate approval permits local delivery. Paper slides and stamps.
				</li>
				<li>
					<strong>13–15s.</strong> The 0x1d1e wordmark settles above “software made during idle cycles.”
					A chord fades. The closing frame holds.
				</li>
			</ol>
		</details>
	</figcaption>
	<div class="showreel-player">
		<video
			controls
			playsinline
			preload="none"
			poster={asset('/film/idle-interrupted-poster.png')}
			width="1920"
			height="1080"
			aria-label="Idle, interrupted. A 15-second motion study"
			aria-describedby="film-summary film-boundary"
		>
			<source src={asset('/film/idle-interrupted.mp4')} type="video/mp4" />
			<track
				kind="captions"
				src={asset('/film/idle-interrupted.vtt')}
				srclang="en"
				label="English: sound captions"
			/>
			Your browser cannot play this film. Use the MP4 download or read the film description.
		</video>
		<p class="technical" id="film-boundary">
			Illustrative motion, not product footage. Sound on if you like.
		</p>
	</div>
</figure>

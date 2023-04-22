<section class="overflow-x-hidden w-screen relative">
	<div class="root">
		<div class="wrapper">
			{#each Array(27) as _, index (index)}
				<div class="column col-{index}">
					{#each Array(12) as _, index (index)}
						<span>{@html `&#${Math.floor(Math.random() * 96) + parseInt('30A0', 16)};`}</span>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</section>

<style lang="scss">
	@keyframes colorPulse {
		0% {
			color: lighten(green, 70%);
		}
		40% {
			color: green;
		}
		50% {
			color: darken(green, 5%);
		}
		100% {
			color: darken(green, 20%);
		}
	}

	.root {
		background: black;
		color: darken(green, 20%);
		font-size: 3em;
		font-family: monospace;
	}

	.wrapper {
		display: flex;
		height: 100vh;
		overflow: hidden;
		text-align: center;
		width: 100vw;
	}

	.column {
		& > * {
			display: block;
			animation: 3s infinite colorPulse;
			padding: 0 0.125em;
		}
	}
	@for $colNum from 1 through 27 {
		$duration: calc(random(100) / 23 + 1);
		$delay: calc($duration / 50);

		@for $i from 1 through 12 {
			.col-#{$colNum} :nth-child(#{$i}) {
				animation-duration: #{$duration}s;
				animation-delay: #{$i * $delay}s;
			}
		}
	}
</style>

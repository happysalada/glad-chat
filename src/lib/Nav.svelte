<script lang="ts">
	import { user, searchQuery } from "$lib/../stores";
	import { goto } from "$app/navigation";

	function signout(): void {
		user.set({});
		goto("/");
	}

	let isDropdownOpen = false;

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}
</script>

<header>
	<nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
		<div
			class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl"
		>
			<a href="https://flowbite.com" class="flex items-center">
				<img
					src="https://flowbite.com/docs/images/logo.svg"
					class="mr-3 h-6 sm:h-9"
					alt="Flowbite Logo"
				/>
				<span
					class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
					>Flowbite</span
				>
			</a>
			<div class="flex items-center lg:order-2">
				<form id="search-form" class="hidden mr-3 w-full lg:inline-block">
					<label
						for="search-bar"
						class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300"
						>Search</label
					>
					<div class="relative">
						<div
							class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"
						>
							<svg
								class="w-5 h-5 text-gray-500 dark:text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/></svg
							>
						</div>
						<input
							type="search"
							id="search-bar"
							class="block py-2 px-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							placeholder="Search"
							required
							bind:value={$searchQuery}
						/>
					</div>
				</form>
				<button
					data-collapse-toggle="mobile-menu-search"
					aria-controls="mobile-menu-search"
					aria-expanded={isDropdownOpen}
					type="button"
					class="lg:hidden inline-flex mr-2 lg:mr-0 items-center text-gray-800 dark:text-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-2.5 lg:px-5 py-2.5 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
					on:click={toggleDropdown}
				>
					<svg
						class="w-5 h-5 lg:mr-2"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							fill-rule="evenodd"
							d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
							clip-rule="evenodd"
						/></svg
					>
				</button>
				<span class="hidden mx-2 w-px h-5 bg-gray-200 lg:inline lg:mx-3" />
				{#if $user && $user?.email }
					<button
						type="button"
						on:click={signout}
						class="inline-flex items-center py-3 px-5 font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-900 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 whitespace-nowrap"
					>
						Sign out
					</button>
				{:else}
				<a
					href="/signin"
					class="inline-flex items-center py-3 px-5 font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-900 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 whitespace-nowrap"
				>
					Sign In / Up
				</a>
				{/if}
				<button
					data-collapse-toggle="mobile-menu-search"
					type="button"
					class="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
					aria-controls="mobile-menu-search"
					aria-expanded={isDropdownOpen}
					on:click={toggleDropdown}
				>
					<span class="sr-only">Open main menu</span>
					<svg
						class="w-6 h-6"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							fill-rule="evenodd"
							d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
							clip-rule="evenodd"
						/></svg
					>
					<svg
						class="hidden w-6 h-6"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/></svg
					>
				</button>
			</div>
			<div
				class="justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
				class:hidden={!isDropdownOpen}
				id="mobile-menu-search"
			>
				<form class="flex items-center mt-4 lg:hidden">
					<label for="search-mobile" class="sr-only">Search</label>
					<div class="relative w-full">
						<div
							class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"
						>
							<svg
								class="w-5 h-5 text-gray-500 dark:text-gray-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
								><path
									fill-rule="evenodd"
									d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
									clip-rule="evenodd"
								/></svg
							>
						</div>
						<input
							type="search"
							id="search-mobile"
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							placeholder="Search for anything..."
							required
						/>
					</div>
					<button
						type="submit"
						class="inline-flex items-center p-2.5 ml-2 text-sm font-medium text-white bg-primary-700 rounded-lg border border-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
						><svg
							class="mr-2 w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/></svg
						> Search</button
					>
				</form>
				<ul
					class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0"
				>
					<!--
					<li>
						<a
							href="#"
							class="block py-2 pr-4 pl-3 text-primary-700 dark:hover:bg-gray-700 hover:bg-gray-50 text-white rounded lg:text-primary-700 lg:p-0 dark:text-white"
							aria-current="page">Add listing</a
						>
					</li>
					-->
					<li>
						<a
							href="#contact"
							class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-white lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
							>Contact</a
						>
					</li>
				</ul>
			</div>
		</div>
	</nav>
</header>

<script lang="ts">
	import { toast } from 'svelte-sonner';
	import dayjs from 'dayjs';
	import { onMount, getContext } from 'svelte';

	import Modal from '../common/Modal.svelte';
	import { SUPPORTED_FILE_EXTENSIONS, SUPPORTED_FILE_TYPE, WEBUI_BASE_URL } from '$lib/constants';

	const i18n = getContext('i18n');

	export let show = false;
	export let uploadDoc: Function;
	let uploadDocInputElement: HTMLInputElement;
	let inputFiles;

	let doc = {
		name: '',
		title: '',
		content: null
	};

	const submitHandler = async () => {
		if (inputFiles && inputFiles.length > 0) {
			for (const file of inputFiles) {
				console.log(file, file.name.split('.').at(-1));
				if (
					SUPPORTED_FILE_TYPE.includes(file['type']) ||
					SUPPORTED_FILE_EXTENSIONS.includes(file.name.split('.').at(-1))
				) {
					uploadDoc(file);
				} else {
					toast.error(
						`File type '${file['type']}' not supported for upload`
					);
					return;
				}
			}

			inputFiles = null;
			uploadDocInputElement.value = '';
		} else {
			toast.error($i18n.t(`File not found.`));
		}

		show = false;
	};

	onMount(() => {
		console.log('mount modal')
	});
</script>

<Modal size="sm" bind:show>
	<div>
		<div class=" flex justify-between dark:text-gray-300 px-5 pt-4">
			<div class=" text-lg font-medium self-center">{$i18n.t('Add Docs')}</div>
			<button
				class="self-center"
				on:click={() => {
					inputFiles = null;
					uploadDocInputElement.value = '';
					show = false;
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
					/>
				</svg>
			</button>
		</div>
		<div class="flex flex-col md:flex-row w-full px-5 py-4 md:space-x-4 dark:text-gray-200">
			<div class=" flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6">
				<form
					class="flex flex-col w-full"
					on:submit|preventDefault={() => {
						submitHandler();
					}}
				>
					<div class="mb-3 w-full">
						<input
							id="upload-doc-input"
							bind:this={uploadDocInputElement}
							hidden
							bind:files={inputFiles}
							type="file"
							multiple
						/>

						<button
							class="w-full text-sm font-medium py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-center rounded-xl"
							type="button"
							on:click={() => {
								uploadDocInputElement.click();
							}}
						>
							{#if inputFiles && inputFiles.length}
								 {$i18n.t(`{{file_numbers}} document(s) selected.` , { file_numbers: inputFiles.length })}
							{:else}
								{$i18n.t('Click here to select documents.')}
							{/if}
						</button>
					</div>

					<div class=" text-xs text-gray-500 text-center">
							ⓘ {$i18n.t(
								'Only support md|pdf|word|txt|xlsx file type.'
							)}
					</div>
					<hr class=" dark:border-gray-850 my-2.5" />

					<div class="flex justify-end pt-5 text-sm font-medium">
						<button
							class=" px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-gray-100 transition rounded-lg"
							type="submit"
						>
							{$i18n.t('Save')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</Modal>

<style>
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		/* display: none; <- Crashes Chrome on hover */
		-webkit-appearance: none;
		margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
	}

	.tabs::-webkit-scrollbar {
		display: none; /* for Chrome, Safari and Opera */
	}

	.tabs {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	input[type='number'] {
		-moz-appearance: textfield; /* Firefox */
	}
</style>

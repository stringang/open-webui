<script lang="ts">
	import { toast } from 'svelte-sonner';
	import fileSaver from 'file-saver';
	const { saveAs } = fileSaver;

	import { onMount, getContext, tick } from 'svelte';
	import { WEBUI_NAME, documents, showSidebar, knowledgebase } from '$lib/stores';
	import { processDocToVectorDB } from '$lib/apis/rag';

	import { SUPPORTED_FILE_TYPE, SUPPORTED_FILE_EXTENSIONS } from '$lib/constants';
	import { blobToFile, transformFileName } from '$lib/utils';

	import AddFilesPlaceholder from '$lib/components/AddFilesPlaceholder.svelte';
	import AddDocModal from './AddDocModal.svelte';
	import EllipsisHorizontal from '$lib/components/icons/EllipsisHorizontal.svelte';
	import DocumentMenu from './DocumentMenu.svelte';
	import { deleteKnowledgeById, getKnowledge, uploadKnowledgeFile } from '$lib/apis/knowledge';
	import Pagination from '$lib/components/common/Pagination.svelte';
	import Spinner from '$lib/components/common/Spinner.svelte';

	const i18n = getContext('i18n');

	export let myself;

	let query = '';
	let documentsImportInputElement: HTMLInputElement;

	let showAddDocModal = false;
	let page = 1; // selected page
	let perPage = 20;


	let loaded = false;
	let dragged = false;
	let debounceTimer;

	const uploadDoc = async (file) => {
		console.log(file);

		// Upload the file to the server
		const uploadedFile = await uploadKnowledgeFile(localStorage.token, file).catch((error) => {
			toast.error(error);
			return null;
		});

		const res = await processDocToVectorDB(localStorage.token, uploadedFile.id).catch((error) => {
			toast.error(error);
			return null;
		});

		if (res) {
			await knowledgebase.set(await getKnowledge(localStorage.token, myself, query, (page - 1) * perPage, perPage));
		}
	};

	const downloadHandler = async (doc) => {
		fetch(doc?.meta?.path)
			.then((response) => response.blob())
			.then((blob) => {
				const objectUrl = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = objectUrl;
				link.download = doc?.meta?.name;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(objectUrl);
			})
			.catch((error) => console.error('Error downloading document:', error));
	};

	const deleteHandler = async (doc) => {
		console.log('delete ', doc)
		const res = await deleteKnowledgeById(localStorage.token, doc?.id).catch((error) => {
			toast.error(error);
			return null;
		});

		if (res) {
			toast.success($i18n.t('Document deleted successfully'));
		}

		await knowledgebase.set(await getKnowledge(localStorage.token, myself, query, (page - 1) * perPage, perPage));
	};

	const debounceSearch = async () => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Set a new timer
		debounceTimer = setTimeout(() => {
			searchKnowledge();
		}, 500); // 0.5 second debounce
	};

	const searchKnowledge = async () => {
		await knowledgebase.set(await getKnowledge(localStorage.token, myself, query, (page - 1) * perPage, perPage));
	};

	const onPageChange = async (currentPage) => {
		await knowledgebase.set(await getKnowledge(localStorage.token, myself, query, (currentPage - 1) * perPage, perPage));
		page = currentPage;
	};

	onMount(async () => {
		loaded = true;
	});

	let knowledge = null ;
	let knowledgeCount;

	$: knowledge = $knowledgebase?.results ?? null;
	$: knowledgeCount = $knowledgebase?.total ?? 0;

	$: {
		if (myself !== undefined) {
			(async () => {
				await knowledgebase.set(await getKnowledge(localStorage.token, myself, query, (page - 1) * perPage, perPage));
			})();
		}
	}

</script>

<svelte:head>
	<title>
		{$i18n.t('Me')} | {$WEBUI_NAME}
	</title>
</svelte:head>

{#if dragged}
	<div
		class="fixed {$showSidebar
			? 'left-0 md:left-[260px] md:w-[calc(100%-260px)]'
			: 'left-0'}  w-full h-full flex z-50 touch-none pointer-events-none"
		id="dropzone"
		role="region"
		aria-label="Drag and Drop Container"
	>
		<div class="absolute w-full h-full backdrop-blur bg-gray-800/40 flex justify-center">
			<div class="m-auto pt-64 flex flex-col justify-center">
				<div class="max-w-md">
					<AddFilesPlaceholder>
						<div class=" mt-2 text-center text-sm dark:text-gray-200 w-full">
							Drop any files here to add to my documents
						</div>
					</AddFilesPlaceholder>
				</div>
			</div>
		</div>
	</div>
{/if}


<AddDocModal bind:show={showAddDocModal} {uploadDoc} />

<div class="flex space-x-2 w-60 h-10">
	<div class="flex">
		<button
			class=" px-2 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:border-0 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition font-medium text-sm flex items-center space-x-1"
			aria-label={$i18n.t('Add Docs')}
			on:click={() => {
				showAddDocModal = true;
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="w-4 h-4"
			>
				<path
					d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z"
				/>
			</svg>
		</button>
	</div>
	<div class="flex flex-1 outline rounded-xl">
		<div class=" self-center ml-1 mr-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="w-4 h-4"
			>
				<path
					fill-rule="evenodd"
					d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
		<input
			class="text-sm pr-4 py-1 w-full rounded-r-xl outline-none bg-transparent"
			bind:value={query}
			on:input={debounceSearch}
			placeholder={$i18n.t('Search Documents')}
		/>
	</div>
</div>

<hr class=" dark:border-gray-850 my-2.5" />

{#if knowledge !== null}
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
		{#each knowledge as doc}
			<div
				class=" flex space-x-4 cursor-pointer text-left px-3 py-2 dark:hover:bg-white/5 hover:bg-black/5 rounded-xl">
				<div class=" flex flex-1 space-x-4 cursor-pointer w-full">
					<div class=" flex flex-col items-center space-x-3">
						<div class="p-2.5 bg-red-400 text-white rounded-lg">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="w-10 h-10"
							>
								<path
									fill-rule="evenodd"
									d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
									clip-rule="evenodd"
								/>
								<path
									d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z"
								/>
							</svg>
						</div>
						<div class=" self-center flex-1 w-60">
							<div class=" font-semibold line-clamp-1 text-center	text-balance">{doc?.meta?.name}</div>
							<div class=" flex flex-row place-content-evenly	text-xs overflow-hidden text-ellipsis line-clamp-1 text-balance">
								<img
										src={doc?.user?.profile_image_url}
										class=" max-w-[20px] object-cover rounded-full"
										alt="User icon"
									/>
								<div class=" self-center font-light	">{doc?.user?.name}</div>
							</div>
						</div>
					</div>
				</div>
				<div class="flex flex-row self-start space-x-1">
					<DocumentMenu
						downloadHandler={() => {
							downloadHandler(doc);
						}}
						deleteHandler={() => {
							deleteHandler(doc);
						}}
						onClose={() => {}}
					>
						<button
							class="self-center w-fit text-sm p-1.5 dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"
							type="button"
						>
							<EllipsisHorizontal className="size-5" />
						</button>
					</DocumentMenu>
				</div>
			</div>
		{/each}
	</div>

	{#if knowledgeCount}
	<Pagination bind:page bind:perPage count={knowledgeCount} onPageChange={onPageChange} />
	{/if}

{:else}
	<div class="flex h-full justify-center">
		<div class="my-auto">
			<Spinner className="size-6" />
		</div>
	</div>
{/if}

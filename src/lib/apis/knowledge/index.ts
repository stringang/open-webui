import { STORE_BASE_URL, WEBUI_API_BASE_URL } from '$lib/constants';

export const createNewDoc = async (
	token: string,
	collection_name: string,
	filename: string,
	name: string,
	title: string,
	content: object | null = null
) => {
	let error = null;

	const res = await fetch(`${STORE_BASE_URL}/api/v1/files/knowledge`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			collection_name: collection_name,
			filename: filename,
			name: name,
			title: title,
			...(content ? { content: JSON.stringify(content) } : {})
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err.detail;
			console.log(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getKnowledge = async (token: string = '', myself: string, search: string, skip: number, limit: number) => {
	let error = null;

	const searchParams = new URLSearchParams();
	searchParams.append('myself', myself);
	searchParams.append('filename', `${search}`);
	searchParams.append('skip', `${skip}`);
	searchParams.append('limit', `${limit}`);

	const res = await fetch(`${STORE_BASE_URL}/api/v1/files/knowledge?${searchParams.toString()}`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		},
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.then((json) => {
			return json;
		})
		.catch((err) => {
			error = err.detail;
			console.log(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res?.data ?? {};
};


export const uploadKnowledgeFile = async (token: string, file: File) => {
	const data = new FormData();
	data.append('file', file);
	let error = null;

	const res = await fetch(`${STORE_BASE_URL}/api/v1/files/knowledge`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			authorization: `Bearer ${token}`
		},
		body: data
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err.detail;
			console.log(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};


export const deleteKnowledgeById = async (token: string, id: string) => {
	let error = null;

	const res = await fetch(`${STORE_BASE_URL}/api/v1/files/${id}`, {
		method: 'DELETE',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.then((json) => {
			return json;
		})
		.catch((err) => {
			error = err.detail;

			console.log(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

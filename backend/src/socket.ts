let ioInstance: any = null;

export function setIo(instance: any): void {
	ioInstance = instance;
}

export function getIo(): any {
	return ioInstance;
}



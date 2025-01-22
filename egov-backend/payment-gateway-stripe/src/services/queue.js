class CacheQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.lock = false; 
    }

    enqueue(job) {
        this.queue.push(job);
        this.processQueue();
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;

        const job = this.queue.shift();

        try {
           
            if (this.lock) {
                this.queue.unshift(job); 
                return;
            }

            this.lock = true; 
            await job();
        } catch (error) {
            console.error('Error processing job:', error);
            
        } finally {
            this.lock = false; 
            this.isProcessing = false;
            this.processQueue(); 
        }
    }
}



module.exports = new CacheQueue();

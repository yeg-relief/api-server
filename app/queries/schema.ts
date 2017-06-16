export default function (PAGE_SIZE, data){
  return {
    index: 'master_screener',
    size: PAGE_SIZE,
    body: {
      query: {
        percolate: {
          field: 'query',
          document_type: 'queries',
          document: data 
        }
      },
      _source: {
        includes: 'meta.*'
      }
    }
  }
}
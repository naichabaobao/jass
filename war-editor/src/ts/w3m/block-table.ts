class BlockTable{
  // Offset of the beginning of the file data, relative to the beginning of the archive.
  filePos:number = 0;
    
  // Compressed file size
  cSize:number = 0;
  
  // Size of uncompressed file
  fSize:number = 0;                      
  
  // Flags for the file. See the table below for more informations
  flags:number = 0;     
  constructor(){};
}

export default BlockTable;
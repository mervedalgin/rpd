declare module '../data.json' {
  interface DataItem {
    value: string;
    text: string;
  }

  interface DataStructure {
    [key: string]: DataItem[];
  }

  const data: DataStructure;
  export default data;
}
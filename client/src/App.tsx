import { useGetService } from "./hooks/usegetService";

function App() {
  const { data } = useGetService("39cd327c-525b-414e-957c-3959a17486a2");

  return <p>{data?.service.createdAt}</p>;
}

export default App;

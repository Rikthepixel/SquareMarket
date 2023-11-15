export default function FrontPage() {
  const sendReq = () => {
    fetch("http://localhost:8080/v1/accounts/health", {
      method: "GET",
      mode: "cors",
      credentials: "include"
    }).then((res) => console.log(res))
  }
  return <>
    Frontpage
    <button onClick={sendReq}>Send</button>
  </>;
}

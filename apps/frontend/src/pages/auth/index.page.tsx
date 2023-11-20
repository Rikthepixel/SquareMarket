
import backend from "@/adapters/backend";
import useAuth from "@/lib/auth/stores/useAuth";

export default function FrontPage() {
  const auth = useAuth();

  const sendReq = async () => {
    const res = await backend.get("v1/accounts/health");
    console.log(res);
  }
  return <div>
    <button onClick={auth.login}>Login</button>
    <button onClick={auth.logout}>Logout</button>
    <button onClick={sendReq}>Send request</button>

    {JSON.stringify(auth.user)}
  </div>;
}

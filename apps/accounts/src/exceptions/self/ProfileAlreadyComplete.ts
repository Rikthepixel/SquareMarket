import Exception from "./Exception";

export default class ProfileAlreadyCompleteException extends Exception {
  name: string = "ProfileAlreadyComplete";
  message: string = "Your profile is already complete";
}

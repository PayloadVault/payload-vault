import "./App.css";
import { Button } from "./components/button/Button";
import { MoonIcon } from "./components/icons";

function App() {
  return (
    <div className="flex flex-col gap-10 w-40">
      aplikacija
      <Button
        text="Click me"
        variant="primary"
        size="medium"
        onClick={() => {}}
      />
      <Button
        text="Disabled"
        variant="secondary"
        size="small"
        onClick={() => {}}
      />
      <Button
        icon={MoonIcon}
        text="Loading"
        variant="primary"
        size="large"
        onClick={() => {}}
      />
      <Button
        icon={MoonIcon}
        text="Loading"
        variant="secondary"
        size="large"
        isLoading={true}
        onClick={() => {}}
      />
      <Button
        icon={MoonIcon}
        text="Approve"
        variant="approve"
        size="medium"
        onClick={() => {}}
      />
      <Button
        icon={MoonIcon}
        text="Decline"
        variant="decline"
        size="medium"
        onClick={() => {}}
      />
    </div>
  );
}

export default App;

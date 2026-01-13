import { useNavigate } from "react-router-dom";

const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="
        absolute top-4 left-4
        px-4 py-2
        text-md font-medium
        rounded bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6b] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50
      "
    >
      ⬅ Home
    </button>
  );
};

export default HomeButton;

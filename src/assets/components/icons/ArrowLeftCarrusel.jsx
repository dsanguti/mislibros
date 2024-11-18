const ArrowLeftCarrusel = ({ onClick, isDisabled, className, pathclassName }) => {
  return (
    <svg
      onClick={!isDisabled ? onClick : null} // Solo permite el clic si no está deshabilitado
      xmlns="http://www.w3.org/2000/svg"
      width="3rem"
      height="3rem"
      viewBox="0 0 24 24"
      className={`${className} ${isDisabled ? "disabled" : ""}`} // Aplica la clase 'disabled' si es necesario
    >
      <path
        className={pathclassName}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="m14 7l-5 5m0 0l5 5"
      />
    </svg>
  );
};

export default ArrowLeftCarrusel;

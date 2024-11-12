const ArrowRightCarrusel = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="3rem"
      height="3rem"
      viewBox="0 0 24 24"
      className={props.className}
    >
      <path
        className={props.pathClassName}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="m10 17l5-5m0 0l-5-5"
      />
    </svg>
  );
};

export default ArrowRightCarrusel;

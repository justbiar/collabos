// Type declarations for Web3Modal custom HTML elements
declare namespace JSX {
  interface IntrinsicElements {
    "w3m-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      size?: "sm" | "md";
      label?: string;
      loadingLabel?: string;
    };
    "w3m-network-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    "w3m-account-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}

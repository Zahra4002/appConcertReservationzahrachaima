export default function Modal({ title, close, children }) {
  return <div className="modal-backdrop" onClick={close}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={close}>×</button><h3>{title}</h3>{children}</div></div>;
}

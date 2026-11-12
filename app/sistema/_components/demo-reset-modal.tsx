import { Modal } from "./modal";

interface DemoResetModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function DemoResetModal({ onCancel, onConfirm }: DemoResetModalProps) {
  return (
    <Modal
      title="¿Reiniciar la demo?"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="sys-button" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="sys-button sys-button--primary"
            onClick={onConfirm}
          >
            Reiniciar
          </button>
        </>
      }
    >
      <p className="sys-reset__text">
        Se borra lo que cargaste en este navegador (cobros, altas, avisos,
        ingresos y cambios de configuración) y la demo vuelve a los datos de
        prueba del principio. No afecta a nadie más.
      </p>
    </Modal>
  );
}

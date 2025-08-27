function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "Cancel",
  confirmColor = "btn-error",
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-6 text-center shadow-lg bg-base-100 rounded-2xl w-80">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2">{message}</p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={onConfirm}
            className={`btn ${confirmColor} px-4 rounded-lg`}
          >
            {confirmText}
          </button>
          <button onClick={onCancel} className="px-4 rounded-lg btn btn-ghost">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

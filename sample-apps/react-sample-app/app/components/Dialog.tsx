import type {
  ReactNode,
  Ref} from 'react';
import {
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

export const Dialog = ({
  children,
  ref,
}: {
  ref?: Ref<HTMLDialogElement | null>;
  children: ((open: boolean) => ReactNode) | ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [dialogElement, setDialogElement] = useState<HTMLDialogElement | null>(
    null,
  );

  useEffect(() => {
    if (!dialogElement) return;

    const mo = new MutationObserver(([record]) => {
      if (record.attributeName !== 'open') return;

      setOpen(dialogElement.open);
    });

    mo.observe(dialogElement, {
      subtree: false,
      attributeFilter: ['open'],
    });

    return () => {
      mo.disconnect();
    };
  }, [dialogElement]);

  useImperativeHandle(ref, () => dialogElement, [dialogElement]);

  return (
    <dialog
      className="w-6/12 h-5/6 rounded-lg p-6 bg-white shadow-lg"
      ref={setDialogElement}
    >
      {typeof children === 'function' ? children(open) : open && children}
    </dialog>
  );
};

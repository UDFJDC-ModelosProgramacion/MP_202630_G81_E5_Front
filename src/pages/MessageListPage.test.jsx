// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  createMessage,
  deleteMessage,
  getMessages,
  updateMessage,
} from '../services/messageService';
import MessageListPage from './MessageListPage';

vi.mock('../services/messageService', () => ({
  getMessages: vi.fn(),
  createMessage: vi.fn(),
  updateMessage: vi.fn(),
  deleteMessage: vi.fn(),
}));

const messages = [
  { id: 1, content: 'Hola, quiero adoptar', sentDate: '2026-11-05' },
  { id: 2, content: 'Gracias por la respuesta', sentDate: '2026-11-06' },
];

const apiError = (status, message) => ({ response: { status, data: { apierror: { message } } } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/adoptantes/7/mensajes']}>
      <Routes>
        <Route path="/adoptantes/:adopterId/mensajes" element={<MessageListPage />} />
      </Routes>
    </MemoryRouter>,
  );

let confirmSpy;

beforeEach(() => {
  vi.clearAllMocks();
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  cleanup();
});

describe('MessageListPage', () => {
  it('lista todos los mensajes del adoptante', async () => {
    getMessages.mockResolvedValue(messages);
    renderPage();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('Hola, quiero adoptar')).toBeTruthy();
    expect(getMessages).toHaveBeenCalledWith('7');
    expect(screen.getByRole('heading', { name: 'Mis mensajes' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('05 nov 2026')).toBeTruthy();
    expect(screen.getByText('06 nov 2026')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver detalle del mensaje 2' })).toBeTruthy();
  });

  it('muestra un mensaje cuando el adoptante aún no ha enviado mensajes', async () => {
    getMessages.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Aún no has enviado ningún mensaje.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('informa que el adoptante no fue encontrado', async () => {
    getMessages.mockRejectedValue(apiError(404, 'The adopter with the given id was not found'));
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toContain('Adoptante no encontrado.');
    expect(screen.queryByText('Aún no has enviado ningún mensaje.')).toBeNull();
  });

  it('permite reintentar cuando falla la conexión', async () => {
    getMessages.mockRejectedValueOnce({ request: {} }).mockResolvedValueOnce(messages);
    renderPage();
    expect((await screen.findByRole('alert')).textContent).toMatch(/conectar con el servidor/);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Hola, quiero adoptar')).toBeTruthy();
    expect(getMessages).toHaveBeenCalledTimes(2);
  });

  it('envía un mensaje válido y vuelve a pedir la lista', async () => {
    const created = { id: 9, content: 'Hola de nuevo', sentDate: '2026-11-06' };
    getMessages
      .mockResolvedValueOnce([messages[0]])
      .mockResolvedValueOnce([messages[0], created]);
    createMessage.mockResolvedValue(created);
    renderPage();
    await screen.findByText('Hola, quiero adoptar');

    fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: ' Hola de nuevo ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(await screen.findByText('Hola de nuevo', { selector: 'p' })).toBeTruthy();
    expect(createMessage).toHaveBeenCalledWith(
      '7',
      expect.objectContaining({ content: 'Hola de nuevo', sentDate: expect.any(String) }),
    );
    expect(screen.getByText('Mensaje enviado correctamente.')).toBeTruthy();
    expect(getMessages).toHaveBeenCalledTimes(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByLabelText('Mensaje').value).toBe('');
  });

  it('no envía el mensaje cuando está vacío', async () => {
    getMessages.mockResolvedValue([]);
    renderPage();
    await screen.findByText('Aún no has enviado ningún mensaje.');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(screen.getByText('El mensaje es obligatorio.')).toBeTruthy();
    expect(createMessage).not.toHaveBeenCalled();
  });

  it('muestra el rechazo del servidor sin agregar el mensaje', async () => {
    getMessages.mockResolvedValue([]);
    createMessage.mockRejectedValue(apiError(404, 'The adopter with the given id was not found'));
    renderPage();
    await screen.findByText('Aún no has enviado ningún mensaje.');
    fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Adoptante no encontrado.');
    expect(screen.getByText('Aún no has enviado ningún mensaje.')).toBeTruthy();
  });

  it('no muestra el formulario cuando el adoptante no existe', async () => {
    getMessages.mockRejectedValue(apiError(404, 'The adopter with the given id was not found'));
    renderPage();
    await screen.findByRole('alert');
    expect(screen.queryByRole('heading', { name: 'Nuevo mensaje' })).toBeNull();
  });

  describe('editar', () => {
    const startEditing = async (id = 1) => {
      getMessages.mockResolvedValue(messages);
      renderPage();
      await screen.findByText('Hola, quiero adoptar');
      fireEvent.click(screen.getByRole('button', { name: `Editar el mensaje ${id}` }));
    };
    const save = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    it('carga el mensaje en el panel y muestra el error porque ya fue enviado', async () => {
      updateMessage.mockRejectedValue(
        apiError(412, 'The message was already sent and cannot be edited'),
      );
      await startEditing();
      expect(screen.getByRole('heading', { name: 'Editar mensaje' })).toBeTruthy();
      expect(screen.getByLabelText('Mensaje').value).toBe('Hola, quiero adoptar');

      fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Texto nuevo' } });
      save();

      expect((await screen.findByRole('alert')).textContent).toContain(
        'No se puede editar un mensaje que ya fue enviado.',
      );
      expect(updateMessage).toHaveBeenCalledWith(
        '7',
        1,
        expect.objectContaining({ content: 'Texto nuevo' }),
      );
      expect(screen.getByText('Hola, quiero adoptar', { selector: 'p' })).toBeTruthy();
      expect(screen.getByLabelText('Mensaje').value).toBe('Texto nuevo');
      expect(screen.getByRole('heading', { name: 'Editar mensaje' })).toBeTruthy();
    });

    it('guarda los cambios si el servidor los acepta', async () => {
      updateMessage.mockResolvedValue({});
      await startEditing();
      save();
      expect(await screen.findByText('Mensaje actualizado correctamente.')).toBeTruthy();
      expect(updateMessage).toHaveBeenCalledWith(
        '7',
        1,
        expect.objectContaining({ content: 'Hola, quiero adoptar' }),
      );
      expect(getMessages).toHaveBeenCalledTimes(2);
      expect(screen.getByRole('heading', { name: 'Nuevo mensaje' })).toBeTruthy();
    });

    it('permite cancelar la edición sin guardar', async () => {
      await startEditing();
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(screen.getByRole('heading', { name: 'Nuevo mensaje' })).toBeTruthy();
      expect(updateMessage).not.toHaveBeenCalled();
    });
  });

  describe('eliminar', () => {
    const clickDelete = (id) =>
      fireEvent.click(screen.getByRole('button', { name: `Eliminar el mensaje ${id}` }));
    const loadMessages = async () => {
      getMessages.mockResolvedValue(messages);
      renderPage();
      await screen.findByText('Hola, quiero adoptar');
    };

    it('elimina el mensaje tras confirmar y desaparece de la lista', async () => {
      deleteMessage.mockResolvedValue();
      await loadMessages();
      clickDelete(1);
      expect(await screen.findByText('Mensaje eliminado correctamente.')).toBeTruthy();
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(deleteMessage).toHaveBeenCalledWith('7', 1);
      expect(screen.queryByText('Hola, quiero adoptar')).toBeNull();
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('no elimina nada si se cancela la confirmación', async () => {
      confirmSpy.mockReturnValue(false);
      await loadMessages();
      clickDelete(1);
      expect(deleteMessage).not.toHaveBeenCalled();
      expect(screen.getByText('Hola, quiero adoptar')).toBeTruthy();
    });

    it('bloquea el botón mientras se elimina', async () => {
      let finish;
      deleteMessage.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
      await loadMessages();
      clickDelete(1);
      expect(
        (await screen.findByRole('button', { name: 'Eliminar el mensaje 1' })).textContent,
      ).toBe('Eliminando...');
      finish();
      expect(await screen.findByText('Mensaje eliminado correctamente.')).toBeTruthy();
    });

    it('rechaza eliminar el mensaje de otro adoptante y lo conserva', async () => {
      deleteMessage.mockRejectedValue(apiError(412, 'The message is not associated to the adopter'));
      await loadMessages();
      clickDelete(1);
      expect((await screen.findByRole('alert')).textContent).toContain(
        'Este mensaje pertenece a otro adoptante.',
      );
      expect(screen.getByText('Hola, quiero adoptar')).toBeTruthy();
    });

    it('quita de la lista un mensaje que ya no existe y avisa', async () => {
      deleteMessage.mockRejectedValue(apiError(404, 'The message with the given id was not found'));
      await loadMessages();
      clickDelete(1);
      expect((await screen.findByRole('alert')).textContent).toContain('Mensaje no encontrado.');
      expect(screen.queryByText('Hola, quiero adoptar')).toBeNull();
    });

    it('cierra la edición si se elimina el mensaje que se editaba', async () => {
      deleteMessage.mockResolvedValue();
      await loadMessages();
      fireEvent.click(screen.getByRole('button', { name: 'Editar el mensaje 1' }));
      expect(screen.getByRole('heading', { name: 'Editar mensaje' })).toBeTruthy();
      clickDelete(1);
      expect(await screen.findByRole('heading', { name: 'Nuevo mensaje' })).toBeTruthy();
    });
  });
});
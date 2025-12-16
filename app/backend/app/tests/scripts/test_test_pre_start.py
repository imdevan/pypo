from unittest.mock import MagicMock, patch

from sqlmodel import select

from app.tests_pre_start import init, logger


def test_init_successful_connection() -> None:
    engine_mock = MagicMock()

    session_mock = MagicMock()
    exec_mock = MagicMock(return_value=True)
    session_mock.configure_mock(**{"exec.return_value": exec_mock})

    # Create a context manager mock that returns session_mock when entered
    context_manager_mock = MagicMock()
    context_manager_mock.__enter__ = MagicMock(return_value=session_mock)
    context_manager_mock.__exit__ = MagicMock(return_value=None)

    with (
        patch("app.tests_pre_start.Session", return_value=context_manager_mock),
        patch.object(logger, "info"),
        patch.object(logger, "error"),
        patch.object(logger, "warn"),
    ):
        try:
            init(engine_mock)
            connection_successful = True
        except Exception:
            connection_successful = False

        assert (
            connection_successful
        ), "The database connection should be successful and not raise an exception."

        session_mock.exec.assert_called_once()
        # Verify the call was made with a select(1) query
        call_args = session_mock.exec.call_args[0]
        assert len(call_args) == 1, "exec should be called with one argument"
        # Check that the argument is a select statement (we can't compare object identity)
        assert str(call_args[0]) == str(select(1)), "exec should be called with select(1)"

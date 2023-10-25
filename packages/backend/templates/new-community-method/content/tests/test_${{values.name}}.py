import pytest

from ${{values.name}}.${{values.name}} import ${{values.name}}


def test_${{values.name}}_positive_factorial():
    """TODO: replace"""
    try:
        assert ${{values.name}}(0) == 1
        assert ${{values.name}}(1) == 1
        assert ${{values.name}}(5) == 120
        assert ${{values.name}}(10) == 3628800
    except Exception as e:
        pytest.fail(str(e))


def test_${{values.name}}_negative_factorial():
    """TODO: replace"""
    try:
        assert ${{values.name}}(-5) is None
        assert ${{values.name}}(-10) is None
    except Exception as e:
        pytest.fail(str(e))

import './Pagination.scss';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Пагінація">
      <button
        className="pagination__button"
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Назад
      </button>
      <span className="pagination__info">
        Сторінка {page} з {totalPages}
      </span>
      <button
        className="pagination__button"
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Далі →
      </button>
    </nav>
  );
}

export default Pagination;
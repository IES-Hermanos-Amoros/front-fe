import React  from "react";
import { useTranslation } from 'react-i18next';

function RecentSalesTable({items}) {
    const { t } = useTranslation();
    const handleStatus = status => {
        switch (status) {
            case 'Approved':
                return 'success';
                break;
            case 'Pending':
                return 'warning';
                break;
            case 'Rejected':
                return 'danger';
                break;
            default:
                return 'success';
        }
    };

  return (
    <table className='table table-borderless datatable'>
        <thead className='table-light'>
            <tr>
                <th scope='col'>#</th>
                <th scope='col'>{t('Cliente')}</th>
                <th scope='col'>{t('Producto')}</th>
                <th scope='col'>{t('Precio')}</th>
                <th scope='col'>{t('Estado')}</th>
            </tr>
        </thead>
        <tbody>
            {items &&
              items.length > 0 &&
              items.map(item => (
              <tr key={item._id}>
                  <th scope="row">
                    <a href="#">{item.number}</a>
                  </th>
                  <td>{item.customer}</td>
                  <td>
                    <a href="#" className="text-primary">
                      {item.product}
                    </a>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge bg-${handleStatus(item.status)}`}>
                      {item.status}
                  </span>
                  </td>
              </tr>
              ))}
        </tbody>
    </table>
  );
}

export default RecentSalesTable;
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Supabase 테이블 하나를 불러오고, 변경 후 다시 불러오는 단순한 훅
export default function useTable(table, { order = 'created_at', ascending = true } = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from(table).select('*').order(order, { ascending });
    if (error) setError(`${table}: ${error.message}`);
    else {
      setRows(data);
      setError(null);
    }
    setLoading(false);
  }, [table, order, ascending]);

  useEffect(() => {
    reload();
  }, [reload]);

  const run = async (buildQuery) => {
    if (!supabase) {
      setError('Supabase가 설정되지 않아 저장할 수 없어요.');
      return false;
    }
    const { data, error } = await buildQuery(supabase.from(table));
    if (error) {
      setError(`${table}: ${error.message}`);
      return false;
    }
    await reload();
    return data ?? true;
  };

  return {
    rows,
    loading,
    error,
    reload,
    // 성공 시 추가된 행 배열, 실패 시 false
    insert: (values) => run((q) => q.insert(values).select()),
    update: (id, values) => run((q) => q.update(values).eq('id', id)),
    remove: (id) => run((q) => q.delete().eq('id', id)),
    upsert: (values, onConflict) => run((q) => q.upsert(values, { onConflict })),
  };
}

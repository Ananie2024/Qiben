package rw.qiben;

public interface MediaStorage {
 String save(byte[] image) throws Exception;
 byte[] load(String key) throws Exception;
}
